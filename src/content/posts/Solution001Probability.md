---
title: Solution Report of Probability and Expectation Topic
published: 2026-01-04 08:33:34
description: Solution of some simple problem
tags: [Probability, Expectation]
category: Solution
draft: false
slug: '202601040833'
---

# A - Luogu P2719 搞笑世界杯

[Problem Statement](https://www.luogu.com.cn/problem/P2719)

This is a straightforward problem. We can solve it easily using DP.

**DP State:**  
Let $dp[i][j]$ denote the probability that A and B end up with the same type of ticket when there are $i$ A-type tickets and $j$ B-type tickets remaining.

**Answer:**  
Obviously, the final answer is $dp[n][n]$.

**Initialization:**  
When only one type of ticket remains, A and B will get the same type for sure, except for the case where only one ticket is left.  
So we have: $dp[i][0] = dp[0][i] = 1$ for $i \ge 2$.

**State Transition:**  
Each ticket is sold based on a fair coin flip, so each choice has a probability of 50%. Therefore,
$$
dp[i][j] = \frac{dp[i-1][j] + dp[i][j-1]}{2}
$$

I won't include the code here since the implementation is straightforward.

# B - Luogu P8804 [蓝桥杯 2022 国 B] 故障

[Problem Statement](https://www.luogu.com.cn/problem/P8804)

The basic application of Bayes' formula.

The original statement is long and packed with information, which makes it hard to follow at first glance.  
So the first step is to rewrite it in a more formal and structured way.

Let $P(A)$ denote the probability that event $A$ occurs, and $P(A \mid B)$ denote the probability that $A$ occurs given that $B$ has occurred.

- $S_i$ denotes the $i$-th fault **Symptom**
- $C_i$ denotes the $i$-th fault **Cause**

Since both terms come with the prefix “fault” and can be confusing, we will simply use the English words **Symptom** and **Cause** in the following discussion.

The problem provides:
- The prior probability of each **Cause** $i$, namely $P(C_i)$
- The conditional probability $P(S_j \mid C_i)$, meaning that **Symptom** $j$ occurs given **Cause** $i$
- A set $S$ of **Symptoms** that have already been observed

Our task is to compute the probability of each **Cause** occurring and then sort them accordingly.

**Important assumptions:**
1. The system can have **only one** active **Cause**
2. Given a **Cause**, all **Symptoms** occur independently

Based on the conditions above, this is a standard application of **Bayes' theorem**.  
The probability that **Cause** $i$ is responsible for the observed symptoms can be written as:

$$
P(C_i \mid S) = \frac{P(S \mid C_i) \cdot P(C_i)}{P(S)}
$$

For clarity, we summarize the notation again:

- $C_i$: the $i$-th **Cause**
- $S_j$: the $j$-th **Symptom**
- $S$: the set of observed **Symptoms**

Thus, the problem reduces to efficiently computing $P(S \mid C_i)$ and $P(S)$.  
The prior probability $P(C_i)$ is already given in the input.

Since all **Symptoms** are independent given a **Cause**, we have:

$$
P(S \mid C_i)
= \prod_{j \in S} P(S_j \mid C_i)
\times
\prod_{j \notin S} \left(1 - P(S_j \mid C_i)\right)
$$

Note that $S$ represents a *specific combination* of symptoms.  
Therefore, we must consider not only that all symptoms in $S$ have occurred, but also that all symptoms **not** in $S$ have *not* occurred.

Once $P(S \mid C_i)$ is known, computing $P(S)$ becomes straightforward.  
Since the system can have only one active **Cause**, we can treat this as a weighted sum:

$$
P(S) = \sum_{i=1}^{n} P(S \mid C_i) \cdot P(C_i)
$$

With these probabilities computed, we can obtain $P(C_i \mid S)$ for each **Cause** and sort them as required.

# D - Luogu P1297 [国家集训队] 单选错位

[Problem Statement](https://www.luogu.com.cn/problem/P1297)

Let's analyze this case by case.

- Case 1 $a_i = a_{i+1}$: In this case, it's clear that the answer for question $i+1$ is also random. The expected value is: $\frac{1}{a_i} = \frac{1}{a_{i+1}}$
- Case 2 $a_i > a_{i+1}$: only $\frac{a_{i+1}}{a_i}$ of the possible answers for question $i$ fall within the range $1 \sim a_{i+1}$. Thus, the expected value is: $\frac{a_{i+1}}{a_i} \cdot \frac{1}{a_{i+1}} = \frac{1}{a_i}$
- Case 3 $a_i < a_{i+1}$: the random answer for question $i$ is only within $1 \sim a_i$, and the probability that the correct answer for question $i+1$ falls within this range is $\frac{a_i}{a_{i+1}}$. So the expected value becomes: $\frac{a_i}{a_{i+1}} \cdot \frac{1}{a_i} = \frac{1}{a_{i+1}}$

Combining all cases, the final answer is:
$$
\sum_{i=1}^{n} \frac{1}{\max(a_i, a_{i+1})}
$$

# E - Luogu P1850 [NOIP 2016 提高组] 换教室

DP State: $dp[i][j][k]$ denote for a prefix of classroom $[1, i]$, switch classroom for $j$ times, and we decide (not) to switch classroom on $i$ (record by $k$, 1 for yes and 0 for no).

Transition: 
```cpp
int C1 = c[i - 1][0];
int C2 = c[i - 1][1];
int C3 = c[i][0];
int C4 = c[i][1];

dp[i][j][0] = std::min(
    dp[i][j][0],
    std::min(
        dp[i - 1][j][0] + mp[C1][C3], // not change anymore
        dp[i - 1][j][1]               // change on i-1 but i not
            + mp[C1][C3] * (1 - k[i - 1])
            + mp[C2][C3] * k[i - 1]
    )
);

dp[i][j][1] = std::min(
    dp[i][j][1],
    std::min(
        dp[i - 1][j - 1][0]           // change on i but i-1 not
            + mp[C1][C3] * (1 - k[i])
            + mp[C1][C4] * k[i],
        dp[i - 1][j - 1][1]           // change both i-1 and i
            + mp[C2][C4] * k[i] * k[i - 1]
            + mp[C2][C3] * k[i - 1] * (1 - k[i])
            + mp[C1][C4] * (1 - k[i - 1]) * k[i]
            + mp[C1][C3] * (1 - k[i - 1]) * (1 - k[i])
    )
);
```

Answer is obviously.

# F - Luogu P3750 [六省联考 2017] 分手是祝愿

DP State: $dp[i]$ denote the expect operator number when button quantity we need press decrease from $i$ to $i-1$.

Transition: 
$$
dp[i] = \frac{i}{n}\times 1 + \frac{n-i}{n} \times (dp[i]+dp[i+1]+1)
$$

This transition means have $\frac i n$ probability press right button, and have $\frac{n-i}{n}$ probability press wrong button. if we press wrong button, we need pay $dp[i+1]$ to make the button quantity we need press decrease to $i$ again, and continue using $dp[i]$ times operation.

then we need simplify the transition equation:
$$
dp[i] = \frac{n+(n-i)\times f[i+1]}{i}
$$

Now answer is obviously.

# G - Luogu P2473 [SCOI2008] 奖励关

DP State: $dp[i][S]$ denote the expected score from round $i$ to round $k$ when, after the first $i−1$ rounds, the selection state of each item is $S$.

Transition:  
For all $i\le j\le n$
1. if $S$ satisfy the state requirement of item $j$, we can decide to select it or not;
2. or, just not select it.

Now answer is obiously.

# Summarize

Above is the all problem of this topic.

Most of problem with probability or expectation will not use very further knowledge so just solve these problem like solving basic DP problem.