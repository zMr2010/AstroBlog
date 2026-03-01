---
title: Mobius Inversion
published: 2026-02-09 10:42:13
description: Basic number theory knowledge
tags: [Math, Mobius Inversion, Dirichlet convolution]
category: Algorithm
draft: false
slug: '202602091042'
---

# Introduction

Inversion is a common tool to solve some math problem. 

This passage will introduce some trick for solving these problem.

# Prerequisites

## Multiplicative Functions

A function $f(n)$ is multiplicative if, for all $a,b$ with $\gcd(a,b)=1$, 
it satisfies $f(ab)=f(a)f(b)$. In particular, if this holds for all $a,b$, 
then the function is called completely multiplicative.

Common multiplicative functions:
- Identity function: $\epsilon(n) = [n=1]$, complete
- Constant function: $\operatorname{1}(n) = 1$, complete
- Equality function: $\operatorname{id}(n) = n$, $\operatorname{id}_{k}(n)=n^k$, complete
- Euler function: $\varphi(n) = \sum_{i=1}^{n}[\operatorname{gcd}(i,n)=1]$ 
- Mobius function:
  $$
  \mu(n)=\begin{cases}
  1 & n=1\\
  0 & \exists\ d\ \operatorname{satisfy\ that}\ d^2 | n\\
  (-1)^k & k\ \operatorname{denote\ quantity\ of\ distinct\ prime\ divisors}
  \end{cases}
  $$
- Number of divisors function: $\operatorname{d}(n) = \sum_{d|n}1$
- Sum of divisors function: $\sigma(n) = \sum_{d|n}d$

## Dirichlet Convolution

Below is the formula of Dirichlet convolution:
$$
(f\ast g)(n) = \sum_{d|n} f(d)g(\frac{n}{d})
$$

Dirichlet convolution satisfy below law:
- Commutative law : $f\ast g = g\ast f$;
- Associative law : $(f\ast g)\ast h = f\ast (g\ast h)$;
- Distributive law : $f\ast (g+h) = f\ast g + f\ast h$;
- Identity element : $f\ast\epsilon = f$.

And below is some important dirichlet convolution:
- $\epsilon =\mu\ast 1$
- $\operatorname{id} = \varphi\ast 1$
- $\operatorname{d}=1\ast 1$
- $\sigma = \operatorname{id}\ast 1$

The proof of these equation isn't difficult but very important, must try to prove them before reading below part.

# Mobius Inversion

The following is the basic form of mobius inversion:

If 
$$
F(n) = \sum_{d|n}f(d),
$$
then
$$
f(n) = \sum_{d|n}\mu(d)F\left(\frac{n}{d}\right).
$$

These relative explain "Inversion" perfectly: using Mobius function to get calculation method from $F(n)$ to $f(n)$ by the calculation method from $f(n)$ to $F(n)$.

And we can using below formula to prove these parttern easily.

Observe the form of the relation from $f(d)$ we can using Dirichlet Convolution to express it:
$$
\begin{aligned}
f &= f \ast \epsilon\\
&= f \ast \mu \ast 1 \\
&= f \ast 1 \ast \mu \\
&= F \ast \mu \\
&= \mu \ast F \\
\end{aligned}
$$

I will explain each step of this proof.
1. Dirichelet Convolution's law: identity element $\epsilon$
2. $\epsilon = \mu \ast 1$
3. Commutative law
4. The relative from $f(n)$ to $F(n)$ : $F = f \ast 1$
5. Commutative law

Mobius Inversion also have another form, this form is base on multiple.

If

$$
F(n)=\sum_{n|d}f(d),
$$

then

$$
f(n)=\sum_{n|d}\mu\left(\frac{d}{n}\right)F(d).
$$

This form cannot prove elegantly like before.

We can expand $F(d)$ in the formula after inversion

$$
f(n)=\sum_{n|d}\mu\left(\frac{d}{n}\right)\sum_{d|e}f(e).
$$

Then swap summation:

$$
f(n) = \sum_{n|e} f(e) \sum_{n | d | e} \mu\left(\frac{d}{n}\right).
$$

Then we define $d = nt, e = ns$ then this equation change to:

$$
f(n) = \sum_{s\ge 1} f(ns)\sum_{t|s}\mu(t)
$$

As we know, because of the natrue of mobius function:

$$
\sum_{t|s}\mu(t) = 
\begin{cases}
1 & s = 1\\
0 & s > 1
\end{cases}
$$

So that equation just can get result when $s = 1$, so the equation change to $f(n) = f(n)$, we finish the proof of multiple form of mobius inversion.

# Classic Problem

Before solve some question, we need know a core trick.

$$
[\gcd(i,j)=1]=\sum_{d|\gcd(i,j)}\mu(d)
$$

This trick even no need to prove. I already say mobius function have a natrue that  the sum of the Mobius functions of the divisors of a number equal to 1 only when that number equal to 1.

## Problem 1

$$
\sum_{i=1}^n\sum_{j=1}^m[\gcd(i,j) = k]
$$

**Solution:**

$$
\begin{aligned}
\sum_{i=1}^n\sum_{j=1}^m[\gcd(i,j) = k] 
&=\sum_{i=1}^{\lfloor n/k\rfloor}\sum_{j=1}^{\lfloor m/k\rfloor}[\gcd(i,j)=1]\\
&=\sum_{i=1}^{\lfloor n/k\rfloor}\sum_{j=1}^{\lfloor m/k\rfloor}\sum_{d|\gcd(i,j)}\mu(d)\\
&=\sum_{d=1}^{\min(\lfloor n/k\rfloor,\lfloor m/k\rfloor)}\mu(d)\sum_{i=1}^{\lfloor n/k\rfloor}[d|i]\sum_{j=1}^{\lfloor m/k\rfloor}[d|j]\\
&=\sum_{d=1}^{\min(\lfloor n/k\rfloor,\lfloor m/k\rfloor)}\mu(d)\left\lfloor\frac{n}{kd}\right\rfloor\left\lfloor\frac{m}{kd}\right\rfloor
\end{aligned}
$$

## Problem 2

$$
\sum_{i=1}^n\sum_{j=1}^md(ij)
$$

Function $d(n)$ is number of divisors function.

**Core Lemma:**

$$
d(ij)=\sum_{x|i}\sum_{y|j}[\gcd(x,y)=1]
$$

**Solution:**

$$
\begin{aligned}
\sum_{i=1}^n\sum_{j=1}^md(ij)
&=\sum_{i=1}^n\sum_{j=1}^m\sum_{x|i}\sum_{y|j}[\gcd(x,y)=1]\\
&=\sum_{i=1}^n\sum_{j=1}^m\sum_{x|i}\sum_{y|j}\sum_{d|\gcd(x,y)}\mu(d)\\
&=\sum_{x=1}^n\sum_{y=1}^m\left\lfloor\frac{n}{x}\right\rfloor\left\lfloor\frac{m}{y}\right\rfloor\sum_{d|\gcd(x,y)}\mu(d)\\
&=\sum_{d=1}^{\min(n, m)}\mu(d)\sum_{x=1}^n\sum_{y=1}^m\left\lfloor\frac{n}{x}\right\rfloor\left\lfloor\frac{m}{y}\right\rfloor[d|x][d|y]\\
&=\sum_{d=1}^{\min(n, m)}\mu(d)\sum_{x=1}^n\left\lfloor\frac{n}{xd}\right\rfloor\sum_{y=1}^m\left\lfloor\frac{m}{yd}\right\rfloor
\end{aligned}
$$

## Problem 3

$$
\sum_{i=1}^n\sum_{j=1}^n i\times j\times \gcd(i,j)
$$

**Solution:**

$$
\begin{aligned}
\sum_{i=1}^n\sum_{j=1}^n i\times j\times \gcd(i,j)
&=\sum_{d=1}^nd\sum_{i=1}^n\sum_{j=1}^nij[\gcd(i,j)=1]\\
&=\sum_{d=1}^nd^3\sum_{i=1}^{\lfloor n/d\rfloor}\sum_{j=1}^{\lfloor n/d\rfloor}ij[\gcd(i,j)=1]\\
&=\sum_{d=1}^nd^3\sum_{i=1}^{\lfloor n/d\rfloor}\sum_{j=1}^{\lfloor n/d\rfloor}ij\sum_{k|\gcd(i,j)}\mu(k)\\
&=\sum_{d=1}^nd^3\sum_{k=1}^{\lfloor n/d\rfloor}\mu(k)\sum_{i'=1}^{\lfloor n/(kd)\rfloor}(ki')\sum_{j'=1}^{\lfloor n/(kd)\rfloor}(kj')\\
&=\sum_{d=1}^nd^3\sum_{k=1}^{\lfloor n/d\rfloor}\mu(k)k^2\sum_{i'=1}^{\lfloor n/(kd)\rfloor}i'\sum_{j'=1}^{\lfloor n/(kd)\rfloor}j'\\
&=\sum_{d=1}^nd^3\sum_{k=1}^{\lfloor n/d\rfloor}\mu(k)k^2\sum_{i'=1}^{\lfloor n/(kd)\rfloor}i'\sum_{j'=1}^{\lfloor n/(kd)\rfloor}j'\\
&=\sum_{d=1}^nd^3\sum_{k=1}^{\lfloor n/d\rfloor}\mu(k)k^2S\left(\left\lfloor\frac{n}{kd}\right\rfloor\right)^2
\end{aligned}
$$

## Problem 4

$$
\prod_{i=1}^n\prod_{j=1}^mf_{\gcd(i,j)}
$$

Function $f(n)$ is Fibonacci sequence.

**Core Lemma:**

$$
f_{\gcd(i,j)}=\gcd(f_i, f_j)
$$

Below is proof.

**Lemma 1.** $\gcd(f_n,f_{n-1})=1$

Prove it by mathematical induction:
- Base case: 
  - For $n=1$, $\gcd(f_1, f_0) = \gcd(1, 0) = 1$
  - For $n=2$, $\gcd(f_2, f_1) = \gcd(1, 1) = 1$
- Inductive hypothesis: Assume it holds for $n = k$.
- Inductive step: When $n = k+1$, $f_{k+1} = f_k + f_{k-1}$, so $\gcd(f_{k+1},f_k)=\gcd(f_k+f_{k-1},f_k)=\gcd(f_k,f_{k-1})=1$. (Becasue of $\gcd(x+y,y) = \gcd(x,y)$)

**Lemma 2.** When $m > n$, $\gcd(f_m,f_n)=\gcd(f_n, f_{m\bmod n})$ holds.

Before prove this lemma, we should know a law $f_{a+b}=f_{a+1}f_b + f_af_{b-1}$
Still use mathematical induction to prove it:
- Base case: For $b = 1$, $f_{a+1}=f_{a+1}f_1 + f_af_0 = f_{a+1}$
- Inductive hypothesis: Assume it holds when $b \le k$.
- Inductive step: When $b = k+1$, 
  $$
  \begin{aligned}
  f_{a+k+1}
  &=f_{a+k} + f_{a+k-1}\\
  &=(f_{a+1}f_k + f_af_{k-1}) + (f_{a+1}f_{k-1} + f_af_{k-2})\\
  &=f_{a+1}(f_k+f_{k-1}) + f_{a}(f_{k-1}+f_{k-2})\\
  &=f_{a+1}f_{k+1}+f_{a}f_{k}.
  \end{aligned}
  $$

When try to prove Lemma 2.

Let $a=n,b=(q-1)n+r$, then $f_m = f_{qn+r} = f_{n+[(q-1)n+r]} = f_{n+1}f_{(q-1)n+r}+f_{n}f_{(q-1)n+r-1}$, So:
$$
\gcd(f_m, f_n) = \gcd(f_{n+1}f_{(q-1)n+r}+f_nf_{(q-1)n+r-1}, f_n).
$$

Because of $\gcd(x+ky, y) = \gcd(x, y)$, so we can simplify above expression to below one:

$$
\gcd(f_m, f_n) = \gcd(f_{n+1}f_{(q-1)n+r}, f_n).
$$

Then becasue of Lemma 1, we can know that $\gcd(f_m, f_n) = \gcd(f_{(q-1)n+r}, f_n)$ (because there are no common divisior between $f_{n+1}$ and $f_n$), then repeat this process, we can found taht $\gcd(f_m, f_n) = \gcd(f_{m\bmod n}, f_n)$

Now we going to prove that core lemma.

Let $d = \gcd(i,j)$. By the Euclidean algorithm,
$$
\gcd(i, j) = \gcd(j, i \bmod j) = \gcd(i \bmod j, j \bmod (i \bmod j)) = \dots = \gcd(d, 0) = d.
$$

Combining **Lemma 2**, we can apply the same reduction process to $\gcd(f_i, f_j)$:
$$
\gcd(f_i, f_j) = \gcd(f_j, f_{i \bmod j}) = \gcd(f_{i \bmod j}, f_{j \bmod (i \bmod j)}) = \dots = \gcd(f_d, f_0).
$$

By definition, $f_0 = 0$, and $\gcd(f_d, 0) = f_d$ (the greatest common divisor of a non-zero number and $0$ is the number itself). Therefore,
$$
\gcd(f_i, f_j) = f_d = f_{\gcd(i,j)}.
$$

**Solution:**

$$
\begin{aligned}
\prod_{i=1}^n\prod_{j=1}^mf_{\gcd(i,j)}
&=\prod_{d=1}^{\min(n, m)}{f_d}^{\sum_{i=1}^n\sum_{j=1}^m[\gcd(i,j)=d]}\\
&=\prod_{d=1}^{\min(n, m)}{f_d}^{\sum_{d|T}^{\lfloor n/k\rfloor}\mu(k)\lfloor\frac{n}{dk}\rfloor\lfloor\frac{m}{dk}\rfloor}\\
&=\prod_{d=1}^{\min(n, m)}\prod_{d|T}{f_d}^{\mu(T/d)\lfloor n/T\rfloor\lfloor m/T\rfloor}
\end{aligned}
$$

The last step is because $a^{x+y} = a^xa^y$, we dismantle the sum.

# Summarize

The core idea of mobius inversion is optmize the time complexity of a expression by the natrue of mobius function.