---
title: Memo of Trigonometric Formula
published: 2026-03-22 20:01:23
description: Useful
tags: [Trigonometric, Math]
category: Memo
draft: false
slug: '202603222001'
---

This is a memo. To prevent me from forgetting some trigonometric formulas.

# Basic Formula

**Unit circle**

Pythagorean Theotheorm

$$
\cos^2 \theta + \sin^2 \theta = 1
$$

**Rotate matrix** (counterclockwise rotation)

$$
\left [
\begin{matrix}
\cos\theta & -\sin\theta \\
\sin\theta & \cos\theta
\end{matrix}
\right ] 
\times 
\left [
\begin{matrix}
x \\ y
\end{matrix}
\right ]
$$

# Sum Formula

$$
\begin{aligned}
& \sin(\alpha + \beta) = \sin\alpha\cos\beta + \cos\alpha\sin\beta\\
& \cos(\alpha + \beta) = \cos\alpha\cos\beta - \sin\alpha\sin\beta\\
& \tan(\alpha + \beta) = \frac{\tan\alpha + \tan\beta}{1-\tan\alpha\tan\beta}
\end{aligned}
$$

# Double and Half Formula

**Double-angle**

For sin.

$$
\sin 2\theta = 2\sin\theta\cos\theta
$$

For cos.

$$
\begin{aligned}
\cos 2\theta 
&= \cos^2\theta - \sin^2\theta \\
&= 1 - 2\sin^2\theta\\
&= 2\cos^2\theta -1
\end{aligned}
$$

For tan.

$$
\tan 2\theta = \frac{2\tan\theta}{1-\tan^2\theta}
$$

**Half-angle**

For sin & cos.

$$
\begin{aligned}
\sin \frac{\theta}{2} &= \pm \sqrt{\frac{1-\cos\theta}{2}} \\
\cos \frac{\theta}{2} &= \pm \sqrt{\frac{1+\cos\theta}{2}}
\end{aligned}
$$

For tan.

$$
\begin{aligned}
\tan \frac{\theta}{2} 
&= \frac{\sin\theta}{1 + \cos\theta}\\
&= \frac{1 - \cos\theta}{\sin\theta}\\
&= \pm \sqrt{\frac{1-\cos\theta}{1+\cos\theta}}
\end{aligned}
$$

The sign is depend on which quardrant $\theta/2$  is in.

Also, there are some other trigonometric identities but they all can be prove by above formula so it's all for this memo.