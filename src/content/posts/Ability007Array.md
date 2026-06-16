---
title: How to Calculate the General Term Formula
published: 2026-06-16 13:51:22
description: The idea behind transforming a linear recursive formula into a general term formula
tags: [Math, Sequences]
category: Algorithm
draft: false
slug: '20260610200322'
---

This passage is used to introduce how to calculate general term formula by linear recursive formula. Let's know some basic information before we start.

- **Linear**: Each term is a linear term of $a$. For example it doesn't exist: $a_i \times a_j$, ${a_i}^2$.
- **Homogeneous**: There is no extra $f(n)$ at end. Warning: constant function ($f(n)$ is always the constant) also be included.
- **Constant Coefficients**: All coefficients of $a$ is constant.
- **Order $k$** : The current item depends on at most the first k items before it.

Then you can use these tags to check which kind of recursive formula fit this article.

# Linear Homogeneous Recurrence with Constant Coefficients

This is the most easy one. This kind of recurrence can be express by below formula:

$$
a_n = c_1a_{n-1} + c_2a_{n-2} + \cdots + c_ka_{n-k}
$$

For this kind of recurrence, we can use a general method called characteristic equation to solve it. The Core idea of characteristic equation is: An exponential sequence $r^n$ only changes by a constant factor when shifted.

So we can let $a_n = r^n$, give you a [example](https://www.luogu.com.cn/problem/P11735):
$$
25 a_n + 20 a_{n-1} = 12 a_{n-2}
$$

Then we have:

$$
\begin{aligned}
25 r^n + 20 r^{n-1} &= 12 r^{n-2} \\
25 r^2 + 20 r &= 12 \\
25 r^2 + 20 r - 12 &= 0
\end{aligned}
$$

This is characteristic equation, then we can calculate $r$ by it. And we should have some little categorical discussion on it.

## Different Root

Define the solution set is $r_1, \dots ,r_k$, then the recurrence can be expressed by

$$
a_n = \sum_{i=1}^k A_i {r_i}^n
$$

Then if problem give we the first $k$ element, we can calculate the coefficients $A$ by them.

As the example I give, the root of $25 r^2 + 20r -12 = 0$ is $r_1 = \frac{2}{5}, r_2 = -\frac{6}{5}$, so we can write the general terms as

$$
r_n = A (\frac{2}{5})^n + B (-\frac{6}{5})^n
$$

Then if we have any two element of this sequence we can calculate $A, B$, but in [this problem](https://www.luogu.com.cn/problem/P11735), question setter give u only $a_0$. What to do? hold on. The setter give us a special condition: $\forall i \ge 0$ satisfy $a_i \ge 0$.

The second term is a negative number less than $-1$, so as $n$ increase, the absolute value of it will increase and it's positive and negative alternately. But the first term is decrease as $n$ increase. So it $B \not = 0$, we always exist $a_i < 0$.

So the answer is obvious. $A = a_0, B = 0$, the general term of $a$ is 
$$
a_n = a_0 \times \left(\frac{2}{5}\right)^n
$$

## Repeat Root

If the characteristic equation is 
$$
\sum_{i=1}^k (r-r_i)^{m_i} = 0
$$

We can express general term as

$$
a_n = \sum_{i=1}^k \left[\left(\sum_{j=0}^{m_i}C_{i,j}n^j\right){r_i}^n\right]
$$

OK, I know it is hard to understand such a ugly expression, so let's see a example.

$$
\begin{aligned}
& a = \{1, 6, 20, \dots \} \qquad \text{index start from 0}\\
& a_n = 4 a_{n-1} - 4 a_{n-2} \\
\end{aligned}
$$

Let $a_n = r^n$, then we can have below characteristic equation

$$
\begin{aligned}
r^n &= 4 r^{n-1} - 4 r^{n-2} \\
r^2 &= 4r - 4\\
r^2 - 4r + 4 &= 0 \\
(r - 2)^2 &= 0
\end{aligned}
$$

Ok know we have repeat root. Base on formula above, we have below general term.

$$
a_n = (A + Bn) 2^n
$$

Then We can use the first two terms to solve for A and B

$$
\begin{cases}
1 = (A + B \times 0) \times 2^0 \\
6 = (A + B \times 1) \times 2^1
\end{cases}
\qquad
\begin{cases}
A = 1\\
B = 2
\end{cases}
$$

So the final general term of this sequence is 

$$
a_n = (1 + 2n) \times 2^n
$$

You can verify it using enumeration.

# Linear non-Homogeneous Recurrence with Constant Coefficients

But we know, in lot of stuation, the recurrence always non-homogeneous. So should we give up? No! This part let we know how to solve general term in linear non-homogeneous recurrence with constant coefficients.

Also we start with a little example. 

$$
\begin{aligned}
a_0 &= 1 \\
a_n &= 2 a_{n-1} + 3
\end{aligned}
$$

We should find a sequence $p$ which also satisfy this recurrence. In this case, we can find a sequence $p = \{-3,-3,-3,\cdots\}$. The core idea is to minus the non-homogeneous part of origin recurrence.

So now we have two sequence: $a_n = 2a_{n-1}+3, p_n = 2p_{n-1}+3$, if we let the recurrence of $a$ minus $p$, we will take a sequence $d$, and this sequence is a linear homogeneous recurrence with constant coefficients.

$$
\begin{aligned}
d_n 
&= a_n - p_n \\
&= (2a_{n-1} + 3) - (2 p_{n-1} + 3)\\
&= 2(a_{n-1} - p_{n-1})\\
&= 2d_{n-1}
\end{aligned}
$$

Then use common sense or the method I introduce last part, we can know $d_n = A 2^{n}$, substitute $d_n$ and $p_n$ we will get general term of $a_n$

$$
\begin{aligned}
a_n = p_n + d_n\\
a_n = -3 + A2^n
\end{aligned}
$$

Then we can use the start value of $a$ to calculate value of $A$, it's $8$.

# Summarize

This article introduce some common and easy situation when we are translating recurrence to general term. In most of situation, Matrix Fast Exponentiation also OKay. But math can optmize $O(k^3 \log n)$ to $O(1)$