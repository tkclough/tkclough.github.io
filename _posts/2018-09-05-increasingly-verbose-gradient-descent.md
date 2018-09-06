---
layout: post
title: "Increasingly Verbose: Gradient Descent"
date: 2018-09-05 01:00:00 -0400
categories:
  - tutorial
math: true
---
A neural network consists of two types of components. There are the hyperparameters, which we humans concern ourselves the 
most with. Then, there are the parameters, which we task the computer with figuring out itself. What does that mean,
though - a computer *learning* the parameters itself? Let's start with a long-winded analogy.

> I've been to the mountaintop, and I have serious vertigo.
>
> -- <cite>Martin Luther King, Jr. (adapted)</cite>

Imagine you've woken up on a mountaintop, and imagine that you are afraid of heights (personally, this does not take
much imagination). "I want down from this mountaintop!", you shout. You want down from this mountaintop. In fact, you 
want to be in the lowest possible point. How would you go about this? Probably, you would look for the lowest point you
can see. Then, you would walk down there. Repeat until at the lowest point.

Now, imagine you've woken up on that same mountaintop, and imagine you are afraid of heights, and imagine you are blind.
"I want down from this mountaintop, and I'm f\*cking blind!" you shout. You *really* want down from this mountaintop.
Now, how would you go about this? Well, you could use a similar procedure. You would tap your foot on the ground around
you, and look for the steepest point of descent. Then, you would step there, and repeat. Do this a few thousand times, 
and you're at the bottom (further imagine that there are no steep cliffs in which following this procedure would kill 
you).

If you squint enough, the second procedure is the same as the first, but you can only look directly around yourself. How
could we describe this mathematically? "Calculus..." you gently whisper, like a mother to her newborn. Calculus is very 
well suited for this. So well suited that you may notice how contrived the scenario is. 

At any step, let's call your current position \\(\textbf{x} = (x_1,x_2)\\) and your elevation \\(J(x_1, x_2)\\). You may 
be more familiar with the names \\(x\\) and \\(y\\) for position, but this will be convenient later. The expression
\\(\frac{\partial J}{\partial x_1}\\) (read "partial J partial x one" or just "dee J dee x one") refers to how your elevation 
changes if you took a small step in the \\(+x_1\\) direction. Similarly, \\(\frac{\partial J}{\partial x_2}\\) refers to how your elevation would change if you took a small step in the \\(+x_2\\) direction. Generalizing, the expression \\(\nabla J\\) 
(called the gradient of \\(J\\), read "del J") is the *vector* \\( \left< \frac{\partial J}{\partial x_1}, \frac{\partial J}{\partial x_2} \right> \\).

Sidebar: there are a few ways to think about vectors. The simplest is to think of it as just a list of numbers (we call numbers
scalars to be more specific). This view is often useful, but here, let's think of a vector as a scalar with a direction.

So, what is the direction of \\(\nabla J\\)? It turns out, this is the direction that will give the steepest *ascent*.
How does that help us? We're not interested in heights, we're interested in depths. It also turns out, \\(-\nabla J\\) 
points in the direction of steepest descent. 

We've effectively done the first step of the blind mountainman procedure. We have our direction. Now we just need to 
know how far to go. Think about it: would you want to take a huge leap if you were blindly going down a mountain? 
Probably not. So we want a small step each time, but \\(-\nabla J\\) could be rather large. We will multiply this by
a really small number \\(\alpha\\). A typical value may be 0.001. 

Let's pull it together now. We are at a position \\(\textbf{x}\\), and our 'step' is the expression \\(-\alpha \nabla J\\). 
To update our position, we add the two together. This is the heart of gradient descent:

$$\textbf{x} \leftarrow \textbf{x} - \alpha \nabla J$$

As a sidenote on notation, the symbol \\(\leftarrow\\) represents updating a variable. In most programming languages,
updating a variable is denoted `y = y + 1`, but the use of the equals symbol here is mathematically contradictory - 
there is no value for \\(y\\) such that the equality will hold. We use the symbol to distinguish from the mathematical
use of the equals symbol. Another notation (perhaps more common) is the \\(:=\\) symbol.

## Towards Neural Nets

All this talk of mountains is nice and all, but how does this help us? The function \\(J\\) is known as the objective 
function, or cost function. Rather than defining what it means to be good, \\(J\\) gives us a number that indicates
how bad the parameters are. To this end, we define another function, called the loss function, \\(\mathcal{L}(y,\hat{y})\\) 
that indicates how off the prediction (\\(\hat{y}\\)) is from the target (\\(y\\)). An example loss function, log loss,
is shown below:

$$\mathcal{L}(y,\hat{y}) = y\text{log}(\hat{y}) + (1 - y)\text{log}(1 - \hat{y})$$

This specific function is common when dealing with binary classification - given input, predict from two classes (yes/no,
dog/no dog, give loan/don't give loan, etc.) The loss function operates on a single example. It compares the neural 
network's prediction to what we would like it to predict. The cost function, in turn, compares *all* the training predictions to the true values. Suppose we have a neural network with parameters \\(\theta\\), \\(f_{\theta}\\). Then, a common cost
function, mean squared error (MSE), is defined as follows:

$$ J(\theta) = \frac{1}{m}\sum_{i=0}^{m}{(y^{(i)} - f_{\theta}(\textbf{x}^{(i)}))^2} $$

Note a few conventions: \\(m\\) is used to denote the number of training examples; \\(y^{(i)}\\) and \\(x^{(i)}\\) 
denote the \\(i\\)th true value and input values, respectively.

When I was learning about gradient descent, a couple of things confused me. First, it is up to the human to define the
cost function *and* compute its gradient. Another confusion was that these algorithms are described in only two 
dimensions, which makes it seem somewhat trivial. However, the math extends to any number of input dimensions. Finally,
why would we bother going through the effort of using calculus rather than using a simpler algorithm. Couldn't we just
check a bunch of parameter choices and choose the best one? This one deserves a section of its own.

## High Dimensionality

We are, somewhat unfortunately, three dimensional beings (four if you're willing to include time). That means our 
ability to visualize directly is limited to at most three (or four) dimensions. This leads us into some traps of 
untuitiveness. I'll describe two.

### The Curse of Dimensionality

This regards the simple, brute-force algorithm that you may have thought of as I was rambling about derivatives and
vectors. Suppose I want to check a size-100 grid of values to find optimal parameters. In one dimension (not really a 
grid), there would be 100 values to check - trivial. In two, there would be 10000 - easy. Three, 1000000 - tractable.
But what about in 10 dimensions? 100? 1000? Given \\(n\\) dimensions, we have \\(100^n\\) values to choose from. In computer
science, exponential trends like this are to be avoided like the plague. If we want to use the brute force algorithm,
we must either limit the parameter dimension, or the size of this grid. All bad options. 

Gradient descent does not suffer from this.

### The Blessing of Dimensionality

The astute may have noticed a problem with gradient descent. There is one scenario in which you reach a point in which
every direction slopes upward, but you are not at the deepest possible point. A point like this is called a local
minimum. This is an issue because the algorithm will have no way to continue descending, but rather be stuck in a point
that is far from optimal. 

Researchers long lamented this as a deadly problem for gradient descent. However, this is a trap deriving from our small 
dimensionality. Local minima are common in two dimensions, but as it turns out, the likelihood of encountering a local minimum decreases as more dimensions are added. 

Gradient descent *loves* dimensions.

## Conclusion

Gradient descent, combined with another crucial algorithm, backpropagation, lead to a truly astounding result. Us humans
design the framework of the neural network, but it figures out the details by itself, by looking at past data. Never
underestimate the power of this idea. It has shown time and time again that it can solve problems we may have considered
impossible just a short time ago. Deep networks often exceed our expectations when we have the datasets to support them.
I continue to be amazed, and I hope you will be, too.