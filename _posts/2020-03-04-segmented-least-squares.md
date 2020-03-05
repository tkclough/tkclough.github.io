---
layout: post
title: "1000+ Words: Segmented Least Squares"
date: 2020-03-04 23:59:00 -0400
categories:
  - algorithms
  - animations
---

Segmented least squares is an extension of plain old least squares that finds a
number of line segments that fit the data. More formally, given some number of
points $(x_1,y_1),\ldots,(x_n,y_n)$ (without loss of generality, assume that 
$x_1 \leq \ldots \leq x_n$), find a number of bounds of line segments 
$i_1,\ldots,i_m$ such that the following is minimized:

$$\sum_{j=1}^{m-1}{c_{i_j,i_{j+1}}} + \lambda m$$

Here, $c_{i_j,i_{j+1}}$ represents the mean squared error of the best fit line
considering points $(x_{i_j}, y_{i_j}),\ldots, (x_{i_{j+1}}, y_{i_{j+1}})$. 
$\lambda$ is a regularizer parameter, chosen by the user, that penalizes larger 
numbers of lines. It acts as a sort of control knob for how complex the model is
allowed to be.

It was not at all obvious to me that this can be solved using dynamic 
programming. Consider the last line segment $i_{m-1}, i_m$. The segment needs
to start somewhere, right? So we can just find the optimal value of $i_{m-1}$.
If we let $\text{OPT}(j)$ be the optimal MSE including points going through
the first $j$ points, then the thing we're trying to minimize is this:

$$\text{OPT}(n) = \operatorname{arg max}_{j < i} \text{OPT}(j) + c_{j, n}$$

From here, we can use the same expression for any point $i$. What's crucial here
is that $\text{OPT}(j)$ does not need to know anything about later points - it's
self contained. Because of this, we are able to store these previous values.

Now that we have the recurrence, it's fairly trivial to write the algorithm to 
compute $\text{OPT}(n)$:
- Set $M[0] = 0$
- For $i = 1 \text{ to } m$:
  * $M[i] = \operatorname{arg max}_{j < i} M[j] + \text{Opt-MSE}(j, i)$
- Return $\text{Find-Solution}(n)$

Below is an animation that displays this, fitting a sine curve. Please excuse
its crudeness, it's written using just SVG in pure JS+JQuery - I'm trying to 
work on my fundamentals before using any frameworks.

{% include 2020/03/04/least_squares.html %}