---
title: DP Optimize
published: 2025-12-24 16:58:01
description: Common optimization of DP (Prefix Transition)
tags: [DP, Optimize]
category: Algorithm
draft: false
slug: '202512241656'
---

# Decision Monotonicity

Decision Monotonicity is a key concept for optimizing dynamic programming transitions.

The idea of *decision monotonicity* is that the **decision points** of the DP exhibit a monotonic property. Before introducing this concept, we first define what a *decision point* is.

> **Definition of Decision Point**
> 
> For a fixed index $i$, an index $j$ is called a **decision point** of $i$ if, for all $j' < i$, $g(j) + w(j, i) \le g(j') + w(j', i)$.
> 
> In this case, $i$ is referred to as the **decision-affected point**.

Note that there may be multiple decision points corresponding to the same $i$.

Intuitively, a **decision point** is an index that attains the optimum in the DP transition for state $i$.

Having defined decision points, we can now introduce **decision monotonicity**. Its precise definition depends on the specific form of the DP transition equation. In the following sections, we will discuss different cases separately.

# Prefix Transition

The standard form of a **prefix transition** is

$$
f[i] = \min_{j<i} \{ g[j] + w(j,i) \}.
$$

If $f = g$, this transition is called a **self-transition**.  
Otherwise, it is called a **heterogeneous transition**.

## Decision Monotonicity in Prefix Transitions

> **Definition (Decision Monotonicity for Prefix Transitions).**
>
> A prefix transition is said to satisfy **decision monotonicity** if the following conditions hold.
>
> Let $ i_1 \le i_2 $.
>
> - For every **decision point** $ j_1 $ of $ i_1 $, there exists a **decision point** $ j_2 $ of $ i_2 $ such that $j_1 \le j_2$.
> - For every **decision point** $ j_2 $ of $ i_2 $, there exists a **decision point** $ j_1 $ of $ i_1 $ such that $j_1 \le j_2$.

Intuitively, **decision monotonicity** in prefix transitions means that the indices of decision points are **non-decreasing** as the state index $ i $ increases.

In the following sections, we will discuss how to optimize prefix DP transitions when the transition satisfies **decision monotonicity**.

## Divide-and-Conquer Strategy

This strategy is applicable only to **prefix heterogeneous transitions**.

> **Algorithm Overview**
>
> - Compute the **decision point** for the midpoint of the current range.
> - By **decision monotonicity**, the valid range of decision points for each subrange can be restricted accordingly.
> - As a result, each decision point is evaluated at most a constant number of times, and the overall time complexity is $O(n\log n)$.

This algorithm is remarkably elegant. When I first encountered it, I was genuinely impressed by its simplicity and efficiency.

## Quadrilateral Inequality

For **self-transitions**, additional conditions are required to optimize the DP.  
The **quadrilateral inequality** is one such condition.

> **Definition (Quadrilateral Inequality).**
>
> A function $w(i, j)$ is said to satisfy the **quadrilateral inequality** if, for all $a \le b \le c \le d$, the following inequality holds:
> $$
> w(a, c) + w(b, d) \le w(a, d) + w(b, c).
> $$
> **Remark:** The inequality sign here is only a formal representation. Its essential meaning is that $w(a, c) + w(b, d)$ yields a better (or no worse) cost than $w(a, d) + w(b, c)$.

There is a well-known theorem stating that if the cost function $w$ satisfies the
**quadrilateral inequality**, then the corresponding DP transition exhibits
**decision monotonicity**.

> **Proof.**
>
> According to the definition of **decision monotonicity**, it suffices to verify the
> following two symmetric conditions:
>
> 1. For every **decision point** $j_1$ of $i_1$, there exists a **decision point**
>    $j_2$ of $i_2$ such that $j_1 \le j_2$.
> 2. For every **decision point** $j_2$ of $i_2$, there exists a **decision point**
>    $j_1$ of $i_1$ such that $j_1 \le j_2$.
>
> Since the two cases are symmetric, we only prove the first one.
>
> Let $i_1 < i_2$, and suppose $j_1$ is a **decision point** of $i_1$.  
> By definition, for all $j' < j_1$, we have
> $$
> g[j_1] + w(j_1, i_1) \le g[j'] + w(j', i_1).
> $$
>
> Now let $a = j'$, $b = j_1$, $c = i_1$, and $d = i_2$.  
> By the **quadrilateral inequality**, it follows that
> $$
> w(j', i_1) + w(j_1, i_2) \le w(j', i_2) + w(j_1, i_1).
> $$
>
> Adding the two inequalities above yields
> $$
> g[j_1] + w(j_1, i_2) \le g[j'] + w(j', i_2).
> $$
>
> This shows that when the decision-affected point moves from $i_1$ to $i_2$,
> the index $j_1$ remains no worse than any $j' < j_1$.  
> Therefore, the decision point of $i_2$ must be greater than or equal to $j_1$.
>
> Hence, the DP transition satisfies **decision monotonicity**.

*Quadrilateral Inequality* can be derived to possess stronger properties.  
This requires starting from another understanding form of *Quadrilateral Inequality*.

Starting from the original inequality, we can make a simple transformation:

$$
\begin{aligned}
w(a, c) + w(b, d) &\le w(a, d) + w(b, c), \\
w(a, d) - w(a, c) &\ge w(b, d) - w(b, c), \\
\bigl(g[a] + w(a, d)\bigr) - \bigl(g[a] + w(a, c)\bigr)
&\ge
\bigl(g[b] + w(b, d)\bigr) - \bigl(g[b] + w(b, c)\bigr).
\end{aligned}
$$

> **How should we interpret this inequality?**
>
> When the decision-affected point moves from $c$ to $d$,  
> the increase in cost when choosing index $a$ as the **decision point**
> is no smaller than the increase when choosing index $b$ as the **decision point**.

We call this phenomenon **Gradual Deterioration**.

Intuitively, *Gradual Deterioration* provides another way to understand
**decision monotonicity** under the **quadrilateral inequality**:
as the decision-affected point increases, earlier decision points
incur higher marginal costs than later ones.
As a result, the optimal decision point shifts monotonically forward.

Moreover, *Gradual Deterioration* reveals an even stronger property:

For **ANY two indices** $j_1 < j_2$, there exists a dividing point $x$ such that  
- for decision-affected points with index less than $x$, choosing $j_1$ is better;
- for decision-affected points with index greater than $x$, choosing $j_2$ is better.

Obviously, a transition with this property must possess *decision monotonicity*, but a transition with *decision monotonicity* may not necessarily satisfy this property.

## Binary-Queue

The conclusion of *Gradual Deterioration* inspires a new idea for optimizing DP.

Let $x_j$ denote the **dividing point** associated with decision point $j$. If $x_{j-1} \ge x_j$, then decision point $j+1$ becomes better than $j$ before $j$ ever becomes better than $j-1$.  
As a result, $j$ will never be an optimal **decision point**.

This observation allows us to design an algorithm that safely ignores all such decision points. By discarding them during the transition process, the DP can be computed much more efficiently.

From the above derivation, we are motivated to maintain an increasing sequence of boundary points and their corresponding optimal decision points $j_1, j_2, \ldots, j_m$.

Suppose we have already processed state $i-1$ and maintained the decision points $j_1, j_2, \ldots, j_m$ for $i-1$. Now we consider state $i$.
When inserting a new possible decision point $i-1$ at the back, we first compute the boundary point $x_m$ between $i-1$ and $j_m$.
If $x_{m-1} \ge x_m$, then $j_m$ will never become an optimal decision point and can
be removed.
By repeatedly applying this process, and finally inserting $i-1$, we can maintain a sequence of decision points with strictly increasing boundary points.

For the current *decision-affected point* $i$, if $j_1$ is worse than $j_2$, then all subsequent points will also prefer $j_2$, and thus $j_1$ can be safely removed. Repeating this process until $j_1$ becomes better than $j_2$, we conclude that $j_1$ is the decision point for $i$, according to the previous derivation.

The above procedure can be conveniently implemented using a deque. Each decision point is inserted into and removed from the deque at most once, so this part contributes linear time complexity.

The key remaining issue is how to compute the boundary point $x$. By the property of *Gradual Deterioration*, $x$ is monotonic and thus can be found by binary search.

Using binary search to compute $x$, the entire process of *self-transition* /*heterogeneous-transition optimization* can be accelerated to $O(n \log n)$.

This method is known as the **binary queue optimization algorithm**.

## Slope Optimization

We can impose additional conditions to further optimize DP.
In some transitions, the cost function $w(i,j)$ has the form
$$
w(i,j) = a(i) + b(j) + c(i)d(j).
$$

This form has a very nice property.
Let us discuss under what conditions such a function $w(i,j)$ satisfies the
**quadrilateral inequality**.

By the principle of *Gradual Deterioration*, consider indices
$
j_1 \le j_2 \le i_1 \le i_2.
$
We have
$$
\begin{aligned}
w(j_1,i_2) - w(j_1,i_1) &\ge w(j_2,i_2) - w(j_2,i_1), \\
c(i_2)d(j_1) - c(i_1)d(j_1) &\ge c(i_2)d(j_2) - c(i_1)d(j_2), \\
\bigl(c(i_2) - c(i_1)\bigr)\bigl(d(j_2) - d(j_1)\bigr) &\le 0.
\end{aligned}
$$

The derivation above shows that when $c$ and $d$ have opposite monotonicity,
the function $w$ satisfies the **quadrilateral inequality**.
Since $w$ only depends on the product $c(i)d(j)$, we can always reorder the indices
so that $c$ is non-decreasing and $d$ is non-increasing.

Under this condition, for a decision-affected point $i$, we only need to compute
$
b(j) + c(i)d(j).
$
This expression is exactly the value of a line evaluated at $x = c(i)$.
Therefore, the dividing point between two decision points can be obtained
by computing the intersection of two lines, rather than by binary search.

This technique is known as **Slope Optimization**.
It can be viewed as a special case of **Binary Queue Optimization** and runs
in linear time, $O(n)$.

If $c$ and $d$ do not have such monotonic properties, we can instead use a
**Li Chao Segment Tree** to maintain the lines and query their values at $c(i)$,
resulting in a time complexity of $O(n \log n)$.
I have already written a detailed introduction to this method in a previous blog post.

> **Link:**  
> [Li Chao Segment Tree](https://old.517group.cn/posts/51746/)

## Anti quadrilateral inequality and Binary-Stack

same with before. we called below formula *Anti Quadrilateral inequality*.
$$
w(a,c)+w(b,d) \ge w(a,d)+w(b,c)
$$
also we have property like *Gradual Deterioration*, we called *Gradual Optimization*. But when a transition fit *Anti Quadrilateral inequality* has no *Decision Monotonicity*.

Why? Because a *Decision Point* can be good when it just add in our decision, but when the index of *Decision-affected* increasing, old *Decision Point* will be better, so this type of transition don't has *Decision Monotonicity*.

But we still can use some structure to maintain this.

For a fixed state $i$, we consider all possible decision points $1, 2, \ldots, i-1$.Under  *Gradual Optimization*, for each candidate decision point $j$,
there exists a dividing point $x_j$ such that after $x_j$, choosing $j$ becomes better
than choosing $j+1$.

Now observe that if $x_{j-1} \le x_j$, then before $j$ ever becomes better than $j+1$ (at $x_j$), $j-1$ has already become better than $j$ (at $x_{j-1}$).
This means that $j$ can never be the optimal decision point at any time,
and therefore can be safely discarded.

By repeatedly applying this elimination process, we obtain a sequence of
candidate decision points $j_1, j_2, \ldots, j_m.$ Moreover, if $j_k$ becomes better than $j_{k+1}$ at time $x_k$,
then the dividing points must satisfy $x_1 > x_2 > \cdots > x_{m-1}$.

Next, consider the current state $i$.
If the last candidate decision point $j_m$ is worse than $j_{m-1}$,
then by *Gradual Optimization*, $j_m$ will never become optimal in the future,
and thus can be removed as well.

It is easy to see that once $j_m$ becomes better than $j_{m-1}$,
$j_m$ is the optimal choice for the current state $i$—that is,
the decision point for $i$.

# Range Transition

This type of transition is relatively simple.
The standard form of a **range transition** is

$$
f[i][j] = \min_{i \le k < j} \bigl\{ f[i][k] + f[k+1][j] + w(i,j) \bigr\}.
$$

If the cost function $w(i,j)$ satisfies the **quadrilateral inequality**
and the following condition (which we call **including monotonicity**),
$$
w(b,c) \le w(a,d),
$$
then this transition is said to have **decision monotonicity**.

Just as in prefix transitions, this property allows us to optimize the
DP to a time complexity of $O(n^2)$.

# Summary

This article discusses several techniques for **DP optimization**.
Many problems involve these ideas, and dynamic programming itself
is a fundamental topic in OI.

However, techniques are only tools.
What truly matters is understanding when and how to adapt them to
different problems.