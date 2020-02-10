---
layout: post
title: "An Introduction to Lambda Calculus"
date: 2020-02-10 01:18:00 -0400
categories:
  - lambda
math: true
---

  Lambda calculus is a formal language for describing computation, invented by Alonzo Church early(ish) in the 20th century. The Church-Turing Thesis proves that Turing Machines and Lambda Calculus are equivalent. Unlike Turing Machines, Lambda calculus has some practical applications in functional programming. But let's leave practicality at the door.
    
# The Basics
An expression in lambda calculus can be described using the following grammar:
    $$E ::= Var | E E | \lambda \alpha.E $$
    If you haven't seen grammar before, this can be read as a recursive description: an expression contains other expressions. The pipes represent alternatives - it can be this or this or this.
    
A variable is the atomic value. A variable can be either bound, which means it represents the argument passed to a function, or free, which just means it is not bound.
    
The second alternative is term application. If the left side is a function, the right side will be applied to that function.
    
The third alternative is abstraction. These objects are functions, and take arguments through application. Note that here, the alpha is a meta-variable. It is a stand-in for any variable name, e.g. $x,y,z$. 
    
This grammar is meaningless with just static terms. The real meat deals with function application. Here's an example:
    
    $$(\lambda x.x) y$$
    
The term in the parentheses is a function, and the right side is just a free variable. To apply the function, we first note the variable that appears after the lambda. After the dot is the function body. To apply a function, we replace the occurrences of that variable with the argument, and then remove the function part of the body. This process is written as $x[x/y]$. This expression reduces to just $x$. 
    
## Caveats
### Multiple argument functions
Usually, when referring to a function that has functions immediately inside it, we abbreviate it as a function taking multiple arguments. For example:
    $$\lambda x.(\lambda y.x) \equiv \lambda x y.x$$
    
The $\equiv$ symbol stands for syntactic equality.
  
### Alpha Equivalence
You may have noticed that the name of a variable is somewhat arbitrary - all that matters is the function to which it is bound. In this sense, the following is true:
    $$\lambda x.x = \lambda y.y$$
These expressions both take single arguments and return that argument. We call such terms alpha equivalence. Note that it is not as crucial to the spirit of lambda calculus as it may seem. There is another way to write expressions that doesn't need the notion of alpha equivalence, called De Bruijn indices.
    
## Beta Reduction
Beta reduction is the process of applying functions in a term. Two terms are said to be beta equivalent if one term eventually reduces to another. This is sometimes denoted like this:
    $$ (\lambda x.x) y =_{\beta} y$$
There are different schemes for reducing expressions, which differ in their selection of the reducible expression, or redex. A redex is a function application that has not been reduced yet. The predominant schemes are normal order, and applicative order. Normal order selects the leftmost outermost redex, while applicative order selects the rightmost innermost redex. This is analogous to the relationship between lazy and strict evaluation while programming (e.g. Python vs. Haskell). In applicative order, arguments to functions are reduced before being passed, while normal order reduces the outermost function before the arguments. For example:
    $$ (\lambda x y.x)((\lambda a.a)z) w$$
In applicative order, the $(\lambda a.a)z$ will be reduced first, while normal order will apply the whole thing first. These two will give the same result except if one scheme expands infinitely, never completing, like this expression.
    
# Data
Unlike programming languages, lambda calculus does not have any notion of primitive types beyond functions, such as booleans or integers. That does not mean it is impossible to represent them, however. Instead of having atomic objects that represent types, we encode them as functions.

## Booleans
A good way to find an encoding for a data type in lambda calculus is to observe how the data type is used. Particularly, in what specific applications will this data type be used? Booleans are commonly used in programming languages in conditional statements, IF p THEN A ELSE B. From this, we can immediately establish an encoding for booleans: they are functions of two arguments that return either the first or second argument, depending on which value we are representing. We will represent truth as a function that takes A and B and returns A, while falsity returns B. Expressing this in lambda calculus:

$$ T = \lambda t f.t$$
$$ F = \lambda t f.f$$

Now, functions of booleans will need to be "aware" of the encoding in order to use it. For example, a function that takes a boolean and an if and else expression is very straightforward:

$$ IFTHENELSE = \lambda p m n.p m n$$

This is somewhat trivial, though; it is essentially just the definition of the boolean. For a less trivial example, let's consider the boolean and, where p and q is true only if both p and q are true. This can be thought of as an if then else statement: if p then q else false. Once we know that one is false, we know the whole thing will be false. As a function:

$$ AND = \lambda p q.p q F$$

Similarly, p or q is true if either argument is true. As an if else statement: if p then true else q. 

$$ OR = \lambda p q. p T q $$

## Natural Numbers
The natural numbers are the positive integers and zero (depending on who you ask). This is a much harder data type to encode because it has an infinite number of values. With booleans, there are only two possibilities, so we essentially did an exhaustive encoding.

We encode a natural number $n$ as a function of two arguments that applies repeatedly applies the first argument to the second $n$ times. Letting $f^n x$ represent applying $f$ to $x$ $n$ times:

$$ n = \lambda f x.f^n x$$

# Recursion
All of this is well and good, but programming languages need to allow for variable computation. None of these examples really express that. How would that even be possible? Normally, a recursive function is defined by referring to its name in its body, but there is no notion of a function name in lambda calculus.

If a function took itself as an argument, it could just refer to that input to do the recursion. This may seem like just pushing the problem one step back, but it is useful insight. Consider the problem of computing $n!$:

$$ Fact(n) = \begin{cases}
1 & n = 0\\
n \times Fact(n-1) & \text{otherwise}
\end{cases}$$

There is the obvious, illegal way to define it (assuming existence of arithmetic functions):

$$ \text{Fact} = \lambda n.(\text{IsZero } n) 1 (\text{Mult } n (\text{Fact } (\text{Sub } n 1))) $$

If we could somehow factor out the recursion (we'll call it fact to distinguish it from the true recursive Fact):

$$ \text{fact} = \lambda f n.(\text{IsZero } n) 1 (\text{Mult } n (f\text{ } (\text{Sub } n 1)))$$

Here, the first argument refers to itself as a whole. There's just one more step to make it truly recursive.

## Fixed Points
What we want is a function $g$ such that $g f = f (g f)$. You'll notice that if we don't bound this somehow, it will grow forever. This is where base cases come in. Note that the base cases don't reference the recursive function, so the calls will stop here. That is, of course, dependent on using a normal order. Because applicative order evaluates the arguments before the whole thing, it will never complete reduction.

The most famous fixed point combinator is called the Y Combinator. It is defined as such:

$$Y = \lambda g.(\lambda x.g(xx))(\lambda x.g(xx))$$ 

Convince yourself that this has the desired properties of a fixed point. Now, we can define the recursion like this:

$$ Fact = Y fact$$

As another exercise, reduce Fact on some small inputs, say $Fact 2$.

Fixed points have a typed analogue, that we'll revisit later in Haskell.

## Data Redux: Infinite Data Structures
Booleans and natural numbers are pretty simple structures. To illustrate the power of lambda calculus further, let's take a look at continued fractions.

The continued fraction for a number $x$ has a representation like this:

$$x = a_0 + \frac{1}{a_1 + \frac{1}{a_2 + \frac{1}{\ldots}}}$$

We can quickly run out of real estate with nested fractions like this, so instead this is often represented as a bracketed list $[a_0,a_1,a_2,\ldots]$. In lambda calculus, we would represent this as $\lambda s.s a_0(\lambda s.s a_1 (\lambda s.a_2\ldots))$, where each $s$ refers to the most recent lambda. A list is either empty, or it is composed of a head, the first element, and a tail, the rest of the list. Each $s$ is a selector function which will give either component.

Infinite continued fractions cannot be explicitly represented for obvious reasons. However, fractions with some type of pattern can be represented as a recursive function. For example, the golden ratio $\phi$ satisfies the recurrence

$$\phi = 1 + \frac{1}{\phi} = 1 + \frac{1}{1 + \frac{1}{1 + \frac{1}{\ldots}}}$$

In other words, it has the continued fraction representation $[1,1,\ldots]$. This is easy to define as a recursive function:

$$\phi = \lambda s.s 1 \phi$$

With the legal representation

$$\phi = Y (\lambda f s.s 1 f)$$

We can't directly do that much with an infinite list. But there is an easy way to get a directly useful representation as a rational number: take the first $k$ elements and then use a placeholder to approximate the rest of the fraction. Given a few functions for rational arithmetic, (addrat, recip), this becomes pretty easy, for a continued fraction $x$, a placeholder $p$, and a maximum depth $d$:

$$\text{approx} = Y (\lambda f x d p.(\text{IsZero } d) p (\text{addrat }(\text{head }x) (\text{recip }(f (\text{tail }x) (\text{sub }d 1) p))))$$

Stay tuned for some hopefully interesting Haskell implementation posts.