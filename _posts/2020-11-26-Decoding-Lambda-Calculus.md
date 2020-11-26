---
layout: post
title: "Decoding Lambda Calculus Terms"
date: 2020-11-26 18:06:00 -0400
math: true
---
I find the idea of programming in pure untyped lambda calculus absurd and 
amusing. I ran into a roadblock with my interpreter, though; the encoded
versions of values in lambda calculus are not super friendly for human eyes.
Even natural numbers take a second to parse: e.g. $\lambda f x.f (f x)$. 
Wouldn't it be nice if the console could print values in their decoded form (as
an aside, everything is an encoding, we're simply so used to seeing 2 that we 
unbox it somewhat automatically as the abstract concept of 2)?

My first idea was to just analyze the syntax tree. This is pretty simple; 
given a Church numeral with variable $f$, we can just count the number of $f$'s.
However, note that this only works if the number is in exactly the form we
expect - it cannot be an un-reduced form of the same concept. This isn't a huge
issue, as we can just reduce the expression prior to decoding it, but it is a 
bit inelegant in my opinion. Couldn't there be some way to represent this 
translation in a more pure way? After all, the encoding must have some meaning
that can be accessed from within lambda calculus, or it would be useless. 

I had to chew on this for a while. Continuing the example of Church numerals,
a natural number $n$ is encoded as repeated application of an argument $f$ to
an argument $x$ - $n$ times, specifically. If we could let $x = 0$, and $f$ be
the successor function $y\rightarrow y + 1$, we could retrieve the decoded
number from the reduced version of the expression. In a psuedo-Haskell notation,
given the encoding $n$, we reduce the expression $n (y\rightarrow y+1) 0$. This
would be nice, but our current grammar cannot support this notion of embedding
typed expressions into lambda calculus computations. To review, we have the 
following data type:

```haskell
data Expr = Var Name
          | App Expr Expr
          | Lam Name Expr
```

My first idea was to parameterize the expression with some type $a$ - the type
of the embedded computations. Then, our data looks like this:

```haskell
data Expr a = Var Name
            | App (Expr a) (Expr a)
            | Lam Name (Expr a)
            | Embedded a
```

The idea here is that the reduction gives you some final expression `Embedded x`,
and you just extract the inner value. Unfortunately, the devil is in the details.
How do encode typed functions here? The `Lam` constructor gives us a way to 
represent untyped functions, but we would need to embed the typed functions 
within the type parameter. For a natural number, maybe we would represent the
intermediate computation as the following:

```haskell
data IntermediateNat = Value Int
                     | Increment
```

With this, we can specify how to combine our typed values:
```haskell
combine :: IntermediateNat -> IntermediateNat -> IntermediateNat
combine Increment (Value n) = Value (n + 1)
combine (Value n) (Value m) = ???
```

Crap. The extra rigidity of a type system means we cannot accept every
combination of applications. There are two options here: we can leave that
as undefined behavior, causing a runtime error, or we can make the possibility
of failure explicit. Whenever possible, we would like to represent all expected
states explicitly within the type system, because it's nice to deal with `Maybe`,
compared to dealing with runtime errors. So, let's do that:

```haskell
combine :: IntermediateNat -> IntermediateNat -> Maybe IntermediateNat
combine Increment (Value n) = Just (Value (n + 1))
combine _ _ = Nothing
```

Maybe we can pass these `combine` functions as an argument to the `reduce`
function. It's an algebra of some type - a partial semigroup, maybe? There is
an additional case to consider when searching for a redex. Specifically

```haskell
App (Embedded Increment) (Embedded (Value n))
```

should now also be considered a redex. I explored the possibility of only 
accepting these embedded redexes when they are valid (e.g., don't accept
`App (Embedded (Value n)) (Embedded (Value m)`), but I ran into trouble with 
that idea later.

Ok, so it looks like we can write a Church encoding decoder. Given an expression
that should be an encoding of a Church numeral, we apply that function to the 
increment and zero embeddings.

```haskell
decodeChurch :: Expr Int -> Maybe Int
decodeChurch n = 
    let e = App (App n (Embedded Increment)) (Embedded (Value 0)) in
        ...do the reduction and extract the value...
```

At this point, I thought I had basically figured out decoding data types. I
then turned my attention to decoding lists. This turned out to be much harder. 
Recall that a list $[x_1,...,x_n]$ is encoded as 
$$\lamdba s_1.s_1 x_1 (\lambda s_2.s_2 x_2 (\ldots(\lambda s_n.s_n x_n nil)\ldots))$$

This is trickier, because it's not as simple as applying a function to a static
"zero" element; we need to get the $x$'s back out. It looked a bit impossible at
first, because it seemed like we would need to be doing $n$ operations at once.
However, recall that a linked list consists of a cons of the head of the list and 
the tail of the list (in Haskell,the cons functions is `(:)`). The bracket notation
is just syntactic sugar. We can desugar our list as $x1:x2:...:xn:[]$, and,
even further (by turning infix (:) into prefix) as  `(:) x1 ((:) x2 (...((:) xn [])...))`. If you're familiar with functional programming, this should remind you of folds. Luckily, a fold is a pure recursive function, which can thus be represented in lambda calculus. All we need now is to figure out how to encode the Haskell cons function and intermediate Haskell lists.

The other tricky part of lists is that they're parameterized over the type of 
element in the list. There are two approaches to this. We can either first
get a list of subexpressions, and then run a conversion function over the
subexpressions, or we can run the conversion function over the subexpressions,
and then decode the list. I somewhat arbitrarily ran with the former option.

Notice that the we currently have no way of getting a Haskell list of expressions, because the algebras we use only operate on decoded values. For
this, I decided to modify the definition of `Expr` to the following:
```haskell
data TypedExpr a = Var Name
                 | App (TypedExpr a) (TypedExpr a)
                 | Lam Name (TypedExpr a)
                 | Typed a
                 | TypedFunc (a -> Maybe (TypedExpr a))
                 | UntypedFunc (TypedExpr a -> Maybe (TypedExpr a))
```

It's also helpful to have a type for the old, pure lambda expressions - let's
call that the `UntypedExpr` type.

This representation will allow us to define functions of any arity. We have two
different kinds of redexes to worry about now. We can define a new data type
to handle all of these types of redexes:
```haskell
data Redex a = UntypedRedex Context Name (TypedExpr a) (TypedExpr a)
             | MixedRedex Context (TypedExpr a -> Maybe (TypedExpr a)) (TypedExpr a)
             | TypedRedex Context (a -> Maybe (TypedExpr a)) a
```

The context is an expression that has a "hole" in it for place where the 
redex comes from. As an aside, I used to represent this as a function
`TypedExpr a -> TypedExpr a`, but this doesn't enforce the constraint that
the hole can only appear once. We can use the following representation:
```haskell
data Context a = LamContext Name (Context a)
               | LeftAppContext (Context a) (TypedExpr a)
               | RightAppContext (TypedExpr a) (Context a)
               | Here
```

We can use some simple structural induction to prove this constraint. The leaf
node `Here` clearly has exactly one hole. Given a non-terminal context $C$, 
assume each of its sub-contexts has exactly one hole. Because every non-terminal
`Context` constructor has exactly one `Context` subexpression, we know that $C$
also has exactly one hole.

Let's get back to business, and lists. First, let's define the empty list 
expression:
```haskell
emptyListExpr :: Expr [a]
emptyListExpr = Typed []
```

That was simple - it's just a typed value we embed in an expression. The cons
expression is more complicated, because it takes in two arguments. The first
argument will be an *untyped* value (an `Expr [a]`), and the second will be a *typed* value (a `[Expr [a]]`). We would like to write the following:
```haskell
consListExpr :: Expr [a] -> [Expr [a]] -> [Expr [a]]
consListExpr = (:)
```

However, `consListExpr` is *not* an expression, it is a Haskell function that
returns an expression. As such, we cannot embed it in an expression. Using the
new representation, we can define a closed form expression as follows:
```haskell
consListExpr :: Expr [a]
consListExpr = 
    UntypedFunc (\x -> Just (
    TypedFunc (\xs -> Just (
        Typed (x:xs)
    ))))
```

I'm not a huge fan of the syntax here. It seems like there might be some nice
way to hide this behind `do`-notation, but we can save that for another time.
Now, given an encoded list `xs`, we can construct an expression that will
reduce to a typed value: `foldr # consListExpr # emptyListExpr # xs` (here,
I introduce the alias `(#) = App`). 

So we're done, right? Well, I thought so, but... no. On a non-empty list,
`foldr f z (x:xs) = f x (foldr f z xs)`. In normal order reduction, `f` is
applied before evaluating the recursive `foldr` call. Unfortunately, the
un-applied recursive `foldr` call is *not* a typed list yet - it only becomes
that way once it's applied. We have two options - switch to applicative order
(ew), or restructure the computation by the time `f` is called, the second
argument is actually a typed list. What if we look to `foldr`'s cousin, `foldl`?
On a non-empty list, `foldl f z (x:xs) = foldl f (f z x) xs`. Now, `f` is not
applied to non-reduced terms. As a side-effect, we can't use cons anymore,
because doing so would result in a reversed-order list -
```haskell
foldl (flip (:)) [] [x1...xn] = flip (:) (flip (:) (flip (:) [] x1) x2)... xn
                              = xn...x2:x1:[]
                              = [xn,...,x1]
```

All we have to do to fix this is switch from cons to snoc. As an implementation
detail, we can use difference lists internally, because snoc is $O(n)$ on 
regular lists, but $O(1)$ for difference lists.