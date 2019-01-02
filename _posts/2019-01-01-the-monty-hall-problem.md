---
layout: post
title: "An Introduction to Probability with the Monty Hall Problem"
date: 2019-01-01 09:00:00 -0400
categories:
  - math
math: true
---
I'm not much for New Year's resolutions, but this year, I'm going to try to 
write more. To kick things off, let's look at a classic math problem.

The Monty Hall Problem involves a game show problem. There are three doors;
one has a car behind it, and two have a goat. The problem assumes that you want
the car as well. First, you, the player, choose a door. Then, the host reveals
a goat behind either of the doors that you *didn't* pick. Now, you have two 
options: stay with your first choice, or switch to the door that the host didn't
reveal. Which is a better option? Is there a better option?

If you're like me (or most people), then you would intuitively guess that there 
is no difference between the two options. You have 50/50 odds. That intuition is
very interestingly incorrect.

One way to arrive at the correct answer is to enumerate the possibilities. Let 
us assume that the doors are labeled $x, y, z$ as to make the specific numbers
irrelevant. Let us consider the two strategies:

Supposing you stay with your initial guess, $x$:
- $x$ is the winning door: you win!
- $y$ is the winning door: the host reveals $z$ and you stay with your choice.
  You lose.
- $z$ is the winning door: the host reveals $y$ and you stay with your choice.
  You lose.

Supposing you take the host's deal:
- $x$ is the winning door: you lose.
- $y$ is the winning door: the host reveals $z$ and you switch to $y$ - you win!
- $z$ is the winning door: the host reveals $y$ and you switch to $z$ - you win!

Surprisingly, it is in your interest to switch, rather than to stay, at 2:1 odds.
However, I find this approach rather unsatisfying. You see that the result is
true, but why?

To get an intuition, here's another approach: consider a variant of the Monty
Hall Problem, where you have 11 doors; one has a car, and 10 have goats (that's
like, a whole farm of goats). After you make your pick, the host reveals 9 of
the doors to be goats. Now, you have the option to switch to the one remaining
door. Maybe you already understand - the one remaining door is the only one
that "survived" the host culling of the doors. So before, you had a 1/11 chance
of guessing the correct door. That means that there is a 10/11 chance that the
correct door is one of the doors that you did not choose. Clearly it is in your
interest to take the host's offer.

This problem has escaped my mathematical ability for a while, but I'm brushing
up on my probability with E.T. Jaynes' *Probability Theory: the Logic of Science*.
Here is my attempt at formalizing the Monty Hall Problem, using the following
notation (where $A$ and $B$ are propositions):
- $\equiv$ denotes equality by definition
- $A + B$ represents "$A$ or $B$"
- $AB$ represents "$A$ and $B$"
- $\bar{A}$ represents "not $A$"
- $A\mid B$ represents "$A$ given $B$ (is true)"

Let us keep the notation of $x, y, z$ for the three doors, and let $I$ denote
our prior information about the problem Let us define the following relevant
propositions:
$$ 
    \begin{align}
       \text{Let } A &\equiv \text{there is a car between door } x\\
       B &\equiv \text{there is a car between door } y\\
       C &\equiv \text{there is a car between door } z\\
       D &\equiv \text{the player chooses door } x\\
       H &\equiv \text{the host reveals a goat behind door } y = \bar{B}
    \end{align}
$$

We are interested in the probabilities of winning after we have picked an
initial door and the host has revealed a goat door. What is this probability
when we switch, $P(C\mid HDI)$?

We can factor the probability with the conditional version of Bayes rule, taking
$DI$ to be our prior information:

$$P(C\mid HDI) = P(C\mid DI) \frac{P(H\mid CDI)}{P(H\mid DI)}$$

The only prior information we have is 
$P(A\mid I) = P(B\mid I) = P(C\mid I) = \frac{1}{3}$.

The first term, $P(C\mid DI)$ is just our prior information $P(C\mid I)$ 
augmented with information $D$: this is irrelevant, because the door that the
player chooses has no bearing on which door has a car. $P(C\mid DI) = \frac{1}{3}$.

The second term, $P(H\mid CDI)$ asks what the probability is that the host would
choose door $y$, given that door $z$ has a car, and the player has chosen door
$x$. The host is not allowed to choose any door but door $y$ under these
circumstances, so $P(H\mid CDI) = 1$.

To find the value of the third term, $P(H\mid DI)$ is slightly more involved.
Notice that $A, B, C$ are both mutually exclusive and exhaustive - one and only
one is true. This means that we can factor the third term into the following sum:

$$
\begin{align}
    P(H\mid DI) &= P(A\mid DI)P(H\mid ADI) + P(B\mid DI)P(H\mid BDI) + P(C\mid DI)P(H\mid CDI)\\
    &= \frac{1}{3} \times \frac{1}{2} + \frac{1}{3} \times 0 + \frac{1}{3} \times 1\\
    &= \frac{1}{2}
\end{align}
$$

Note that $P(H\mid ADI) = \frac{1}{2}$ because the host is allowed to choose 
door $y$ or $z$, and we assume that he will choose without preference; $P(H\mid BDI)$
asks the probability that the host will choose door $y$ given door $y$ has a car - 
the host is not allowed to do this, so this probability is 0.

Then, $P(C\mid HDI) = \frac{1}{3} \times \frac{1}{\frac{1}{2}} = \frac{2}{3}$,
the result from before. The strategy of staying can be computed by noticing:

$$
\begin{align}
    P(A\mid HDI) + P(B\mid HDI) + P(C\mid HDI) &= 1\\
    P(A\mid HDI) &= 1 - (P(B\mid HDI) + P(C\mid HDI))\\
    P(A\mid HDI) &= 1 - (0 + \frac{2}{3})\\
    P(A\mid HDI) &= \frac{1}{3}
\end{align}
$$

I really enjoyed turning this problem into a conditional probability one. 
Probability seems like the correct way to infer from data: it is a normative
approach to reasoning. The idea that we can reason formally about uncertainty
is appealing and so very human.