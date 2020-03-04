---
layout: post
title: "Food for Thought: the wisdom of doing the same thing over and over again"
date: 2019-09-29 14:10:00 -0400
categories:
  - food for thought
---
> The definition of insanity is doing the same thing over and over again and 
> expecting a different result.
> -- Albert Einstein (probably apocryphal)

This quote came to mind the other day when I was trying to get some code past
QA. Before code goes live (e.g. before a user sees my changes to a website),
it needs to pass a series of automated tests. My tests failed. I clicked retry.
It failed again. After poring over details of my updates for hours, I used the 
time-honored practice of just trying it again, and it worked.

I work on a team with a pretty large number of software engineers. This means
that, when I click the retry button, things might have changed behind the 
scenes. In other words, doing the same thing over and over again was, in this
case, *not* the definition of insanity. In the world of science, the state
of the system is generally known completely, so Einstein's mentality makes
sense. Unfortunately, in the real world (e.g. SE world), there is state that is 
not easily available to us (This distinction is analagous to the difference
between standard Markov Decision Processes (MDPs), where state is totally known,
and Partially Observable Markov Decision Processes (POMDPs), where there is only
a belief in the current state). In the real world, when we face scenarios with
this massive unknown state, the optimal action, the _sane_ action, is to just do 
it again. So rest easy, and click retry.