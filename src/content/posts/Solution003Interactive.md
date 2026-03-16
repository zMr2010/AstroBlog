---
title: Solution Report of Interactive Topic
published: 2026-03-02 11:50:13
description: Interesting type of problem
tags: [Interactive]
category: Solution
draft: true
slug: '202603021150'
---

# A - [APIO2016] Gap

[Problem Statement](https://uoj.ac/problem/206)

Give a increasing array $a_1, a_2 , \dots, a_n(0\le a_1 < a_2 < \cdots < a_N\le 10^{18})$. You need find the maximum of $a_{i+1}-a_i(0\le i\le N-1)$ in array.

There is function `MaxMin(s, t, &mi, &mx)`: it will save the minimum into `mi` and maximum into `mi` in value range $[s, t]$

You need finish a function, this function return the answer.

There is limit on function `MaxMin` can be called, you can see more in origin problem statement.

**Solution:**

When $T = 1$, we can call function `MaxMin` for $\frac{n+1}{2}$ times, so just query to get leftmost and rightmost element unknown.

When $T = 2$, It's become a difficult problem. We can imagine that 

