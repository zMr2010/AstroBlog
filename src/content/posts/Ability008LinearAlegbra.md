---
title: Understanding of Linear Alegbra (Chapter 1 ~ 3)
published: 2026-08-14 15:27:22
description: Note for first 3 chapters of "Introduction to Linear Algebra"
tags: [Math, Linear Alegbra, Matrix]
category: Algorithm
draft: true
slug: '202608141527'
---

This passage is my understanding of first 3 chapters of *Introduction to Linear Algebra*, and I will make some different on lecture sequence with [MIT](https://www.bilibili.com/video/BV1ix411f7Yp/). Then maybe will tell something for previewing.

That's all, let's begin.

# Vector

First, I will tell you what is vector and two operation with vector in Linear Algebra. 

## Basic Difinition

A vector would be written as below's format,

$$
\bold{v} \  / \ \overrightarrow{v} = 
\left[\begin{matrix}
1 \\ 2 \\ 3
\end{matrix}\right]
$$

For a vector named $v$, it will be written as a column as order of it components from up to down, then enclose it in a square bracket. Denote it as $\bold{v}$ in bold or $\overrightarrow{v}$ under a right arrow.

OKay, that basic difinition of vector, also we have some special, a vector which all components are zero, such vectors we called **zero vector** denote as $\bold{0}$.

Then we have geometry meaning of vectors. For a vector with $n$ components, we believe that it is $n-$dimension. So we can draw it in a $n-$dimension space. For example, we can draw $\bold{v} = (1, 2)$ in a plane. (because of inline Latex require, I cannot type vector in column format, sorry.)

<img src="/images/20260818-1.png" width="50%" alt="a Vector" style="display: block; margin: 0 auto;"/>

The drawing rule is find the point denotes vector then make a arrow from $\bold{0}$ to point.

## Basic Operations

Next, let we see two operation of vector in Linear Algebra: **Scalar multiplication** and **addition**. First is scalar multiply, most of number we studied in primary school is scalar like nature number, float, etc. That means scalar can multiply with a vector,

$$
c \times \bold{v} = c
\left[\begin{matrix}
1 \\ 2 \\ 3
\end{matrix}\right]
=
\left[\begin{matrix}
c \\ 2c \\ 3c
\end{matrix}\right]
$$

Then is vector addition, two vectors can be added when they have same component quantity, such as

$$
\bold{u} + \bold{v} =
\left[\begin{matrix}
1 \\ 2 \\ 3
\end{matrix}\right]
+
\left[\begin{matrix}
2 \\ 3 \\ 4
\end{matrix}\right]
=
\left[\begin{matrix}
3 \\ 5 \\ 7
\end{matrix}\right]
$$

Also we can understand these two operation in geometry meaning. Let me show you $c$ times $\bold{v} = (1, 2)$ when $c$ equal $-1, 2$; And $\bold{u} = (2,1)$ add $\bold v$.

<div style="display: flex; justify-content: center; align-items: center; gap: 16px;">
  <img src="/images/20260818-3.png" alt="scalar multiplication" style="height: 300px; width: auto;" />
  <img src="/images/20260818-2.png" alt="vector addition" style="height: 300px; width: auto;" />
</div>

The second picture is vector addition, the parallelogram I drew is called parallelogram law, also we have triangle law, that all help us draw vector addition in space quickly. Just let these vector end-to-end connect the start point to the end point is answer vector. This is very important in next part.

## Linar Combination

Now we know what is vector and two operation in Linear Algebra, now we can start to entrance the Linear Algebra world. The question you may ask naturally is, why these two operation? What will I get if I combine them?

So the **Linear Combination** going out naturally. For a group of $\bold{v}$, below formula called Linear Combination.

$$
c_1\bold{v}_1+c_2\bold{v}_2+\cdots+c_n\bold{v}_n
$$

You can check $\bold{v}=(1,2), \bold{u} = (2, 1)$ can or cannot calculate all vector in plane by Linear Combination. Of course can, so the next part we are going to find some pattern in Linear Algebra.

## Space 

We use $\R$ to denote all real numbers, and it is obviously 1 dimension. And $\R^2$ is to denote a 2 dimension plane, $\R^3$ is to denote a 3 dimension space, etc. These are all special **space**. 

The definition of space is a set that the vector in space after linear combination are still in space, just like group. To understand it, I can give some example. 

Such as, do you think $\{(1, 1)\}$ is a space? No, because when $c \neq 1$, $c\times (1, 1)$ is not in space. It seems that single vector cannot form a space. **No, zero vector can**. Because $c \times \bold{0} = \bold{0}$ whether what value $c$ takes.

That give out a tips: all space got $\bold{0}$ in its dimension, that because when $c = 0$, all vector multiply $c$ become $\bold{0}$.

So this time we got smart, we can use all vectors on the line which through origin point and node $(1, 1)$, that must be a space. Why? Because you can find whether how we linear combination these vector they still on this line. This pattern stand in all dimension even 11 dimension, if only it a line through zero point, it is a space. Also we can generalize this property to spaces of other dimensions: 

> In a $\R^n$ space, a set of $m$-dimension vectors ($m\le n$) through origin point form a space. 
> 
> It could be a line through origin in $\R^3$, a plane through origin in $\R^3$, even whole $\R^3$ (that is because $\R^3$ through origin obviously)

## Independence

Without zero vector, we expect $n$ vectors can span to a $n$-dimension such as $(1, 1)$ and zero vector can span to a 1 dimension line, $(1,2), (2, 1)$ and zero vector can span to a 2 dimension plane.

But there is a counterexample, or there are many conterexamples, for example $(1, 1)$ and $(2, 2)$ cannot span to a 2 dimension plane but a 1 dimension line. That shows a new pattern to us, we call this pattern as **Independence**.

The reason of $\bold{u} = (1, 1)$ and $\bold{v} = (2, 2)$ cannot span to a 2 dimension plane is $\bold{v} = 2\times\bold{u}$. For a set of vector, if one of them can be denote by others linear combination, we call this vector is dependence with other vector. Or, we call this set of vector is independence.

There is a common mistakes: $\bold 0$ is not independ with any vectors.

## Linear Basis

Ok, here is another new concept, because of in the example line through origin and $(1, 1)$, the vector $(1, 1)$ obviously have strong connection with that space. The **Linear Basis** is coming out.

Why I always say $(1, 1)$ span a space, $(1, 2), (2, 1)$ span a space, that must because these vector have some significant connection with them space. The answer is, you can find that all vector in those space can be denoted by the linear combination of vectors I given.

The definition of Linear Basis is that a set of vectors which are independence. We call a basis of space is that a set of vectors which have minimum size and independence and it can span to the space. And obviously the basis of a space is commonly not unique.

Because $\bold 0$ is not independ with any vectors, so basis are always without zero vector, except a space only have zero vector.

The basis also have dimension, because of all vector in basis are independence, so the dimension of basis is the size of basis. Also we can optimize the definision of space: the dimension of space equal to the dimension of its basis.

In the following article, I will use $\operatorname{dim} X$ to denote the dimension of $X$.

## Orthogonality

This part was written in book but MIT didn't teach in the part which corresponding lecture. And it is also become a big nature when we are studing four subspace of matrix.

For two vectors in same dimension, we multiply each pair of components and sum them called **dot product**. And it is a scalar, below is a example:

$$
\bold{u} \cdot \bold{v} = 
\left[\begin{matrix}
1 \\ 2
\end{matrix}\right]
\cdot
\left[\begin{matrix}
4 \\ 5
\end{matrix}\right]
=
1\times 4 + 2\times 5
= 14
$$

And for a pair of special vectors, such as

$$
\bold{u} \cdot \bold{v} = 
\left[\begin{matrix}
4 \\ 2
\end{matrix}\right]
\cdot
\left[\begin{matrix}
-1 \\ 2
\end{matrix}\right]
=
4\times (-1) + 2\times 2
= 0
$$

We called $u\perp v$, and this is **orthogonality**. If dot product answer of two vectors is zero, they are vertical.

# Matrix

This part we are going to learn a new concept, **Matrix**. For a matrix $M$ which is $m\times n$, I will write it as below form, and $M_{i, j}$ denotes the element which place $i$-th row and $j$-th column.

$$
M = 
\left[\begin{matrix}
M_{1, 1} & M_{1, 2} & \ldots & M_{1, n} \\
M_{2, 1} & M_{2, 2} & \ldots & M_{2, n} \\
\vdots & \vdots & \ddots & \vdots \\
M_{m, 1} & M_{m, 2} & \ldots & M_{m, n}
\end{matrix}\right]
$$

Matrix also have two basic operation, and in this part we will learn it and use them analyze a classic problem in Linear Algebra next part.

Let's begin.

## Multiplication

The most important operation is **Matrix Multiplication**, we use below 

 to calculate it:

$$
(A\times B)_{i, j} = 
\sum_{k = 1} ^ n A_{i,k}\times B_{k,j}
$$

So it is not hard to find that the quantity of A's column must equal to the quantity of B's row. We usually say $A$ is a $m\times n$ matrix, $B$ is a $n\times p$ matrix. Basically, all the operation of matrix can be rewritten in a matrix multiplication form.

Because of the special calculate way of matrix multiplication, the matrix multiplication doesn't support commutative law but it does support associative law. So we always multiply a matrix at left to find more connections:

$$
A(BC) = (AB)C \neq A(CB)
$$

Analogy scalar multiplication, maybe matrix multiplication also have a identity just like number $1$, which can make every matrix multiply it will not change. Yes it is obviously have, we call this martix $I$, identity matrix. 

$$
AI = IA = A
$$

This matrix are written as a $n\times n$ square matrix, and it is all zero but only main diagonal one. below is a $3\times 3$ identity matrix:

$$
I=
\left[\begin{matrix}
1 & 0 & 0 \\
0 & 1 & 0 \\
0 & 0 & 1
\end{matrix}\right]
$$

Matrix multiplication is a great operation, there are a further understanding of it, Linear Combination. We can only observe one process of multiplication in below example:

$$
I\times A = 
\left[
\begin{array}{ccc}
1 & 0 & 0 \\
\hline
0 & 1 & 0 \\
0 & 0 & 1 \\
\end{array}
\right]
\times
\left[
\begin{array}{ccc}
1 & 2 & 3 \\
\hline
2 & 4 & 7 \\
3 & 5 & 8 \\
\end{array}
\right]
=
\left[
\begin{array}{ccc}
1 & 2 & 3 \\
\hline
2 & 4 & 7 \\
3 & 5 & 8 \\
\end{array}
\right]
$$

This is nothing news, right? But if I change the $I_{1, 3}$ to one, the difference happened.

$$
B\times A = 
\left[
\begin{array}{ccc}
1 & 0 & 1 \\
\hline
0 & 1 & 0 \\
0 & 0 & 1 \\
\end{array}
\right]
\times
\left[
\begin{array}{ccc}
1 & 2 & 3 \\
\hline
2 & 4 & 7 \\
3 & 5 & 8 \\
\end{array}
\right]
=
\left[
\begin{array}{ccc}
4 & 7 & 11 \\
\hline
2 & 4 & 7 \\
3 & 5 & 8 \\
\end{array}
\right]
$$

The first line of answer becomes sum of first line and last line of $A$! Why? Think the process of multiplication, you can find that when first row $(1, 0, 1)$ times each column of $A$, we sum the first row element and last row element:

$$
\begin{aligned}
4 & = B_{1, 1} \times A_{1, 1} + B_{1, 2} \times A_{2, 1} + B_{1, 3} \times A_{3, 1} = 1 \times 1 + 0 \times 2 + 1 \times 3\\
7 & = B_{1, 1} \times A_{1, 2} + B_{1, 2} \times A_{2, 2} + B_{1, 3} \times A_{3, 2} = 1 \times 2 + 0 \times 4 + 1 \times 5\\
11& = B_{1, 1} \times A_{1, 3} + B_{1, 2} \times A_{2, 3} + B_{1, 3} \times A_{3, 3} = 1 \times 3 + 0 \times 7 + 1 \times 8\\
\end{aligned}
$$

So we find the key, when we left times a matrix, the row of first matrix control the linear combination coefficient of second rows, that means answer matrix can write by below forms, $A_{rn}$ denote the $n$-th row of matrix $A$.

$$
B_{r1}\times A = 
B_{1, 1} \times A_{r1} + B_{1, 2} \times A_{r2} + \ldots + B_{1, n} \times A_{rn}
$$

That means left-multiplication denotes row of $B$ times each row of $A$. Also we can check the similiar nature of right-multiplication. Observe below two expression:

$$
\begin{aligned}
A\times I &= 
\left[
\begin{array}{cc|c}
1 & 2 & 3 \\
2 & 4 & 7 \\
3 & 5 & 8 \\
\end{array}
\right]
\times
\left[
\begin{array}{cc|c}
1 & 0 & 0 \\
0 & 1 & 0 \\
0 & 0 & 1 \\
\end{array}
\right]
=
\left[
\begin{array}{cc|c}
1 & 2 & 3 \\
2 & 4 & 7 \\
3 & 5 & 8 \\
\end{array}
\right]
\\
A\times B &= 
\left[
\begin{array}{cc|c}
1 & 2 & 3 \\
2 & 4 & 7 \\
3 & 5 & 8 \\
\end{array}
\right]
\times
\left[
\begin{array}{cc|c}
1 & 0 & 1 \\
0 & 1 & 0 \\
0 & 0 & 1 \\
\end{array}
\right]
=
\left[
\begin{array}{cc|c}
1 & 2 & 4 \\
2 & 4 & 9 \\
3 & 5 & 11 \\
\end{array}
\right]
\end{aligned}
$$

Now the change happened on last column, and we can find the pattern easily by experience before, that is the linear combination coefficients of column of $A$ are depend on the columns in $B$.

So we get the most important nature: left-multiplication controls row combination and right-multiplication controls column combination.

## Inverse

Think the knowledge we learn in scalar multiplication, there is a concept just like reciprocal which satisfy $B\times A = I$, it called **Inverse**. We use $A^{-1}$ to denote it. This will help us to derive expresion.

Now we don't need to know how to calculate it but should know the concept. And not all the matrices can be inversed.

## Transpose

**Transpose** a matrix follow rule ${A^T}_{i, j} = A_{j,i}$, so the $m\times n$ matrix will be transpose to a $n\times m$ matrix. Below is two example:

$$
\begin{aligned}
\left[\begin{matrix}
1 & 2 & 3 \\
4 & 5 & 6 \\
7 & 8 & 9 \\
\end{matrix}\right]^T &=
\left[\begin{matrix}
1 & 4 & 7 \\
2 & 5 & 8 \\
3 & 6 & 9 \\
\end{matrix}\right] \\
\left[\begin{matrix}
1 & 2 \\
3 & 4\\
5 & 6 \\
\end{matrix}\right]^T &=
\left[\begin{matrix}
1 & 3 & 5 \\
2 & 4 & 6 \\
\end{matrix}\right]
\end{aligned}
$$

And there also have a obviously pattern: $A^{TT} = A$

Also you just need to know a concept now, the applying will coming soon.

## Permutation Matrix

After the matrix multiplication, there is a interesting operation is switching two row or two column of a matrix. Let us start with switching rows.

Because of the conclusion we find, we find that if we just need to switch two rows, we can just switch the corresponding row of identity matrix. For example, we need to switch the row $1$ and row $3$ of a $3\times 3$ matrix, so we do:

$$
P\times A = 
\left[\begin{matrix}
0 & 0 & 1 \\
0 & 1 & 0 \\
1 & 0 & 0 \\
\end{matrix}\right]
\times
\left[\begin{matrix}
1 & 2 & 3 \\
4 & 5 & 6 \\
7 & 8 & 9 \\
\end{matrix}\right]
=
\left[\begin{matrix}
7 & 8 & 9 \\
4 & 5 & 6 \\
1 & 2 & 3 \\
\end{matrix}\right]
$$

You know we have $n!$ permutations of identity, for a $3\times 3$ identity these $6$ matrices called **Permutation Matrix**. This set of matrices also make up a group about operation transpose (or inverse).

Below is all permutation matrix which is $3\times 3$.

$$
\left[\begin{matrix}
1 & 0 & 0 \\
0 & 1 & 0 \\
0 & 0 & 1 \\
\end{matrix}\right],
\left[\begin{matrix}
1 & 0 & 0 \\
0 & 0 & 1 \\
0 & 1 & 0 \\
\end{matrix}\right],
\left[\begin{matrix}
0 & 1 & 0 \\
1 & 0 & 0 \\
0 & 0 & 1 \\
\end{matrix}\right],
\left[\begin{matrix}
0 & 1 & 0 \\
0 & 0 & 1 \\
1 & 0 & 0 \\
\end{matrix}\right],
\left[\begin{matrix}
0 & 0 & 1 \\
1 & 0 & 0 \\
0 & 1 & 0 \\
\end{matrix}\right],
\left[\begin{matrix}
0 & 0 & 1 \\
0 & 1 & 0 \\
1 & 0 & 0 \\
\end{matrix}\right]
$$

The transpose of them is:

$$
\left[\begin{matrix}
1 & 0 & 0 \\
0 & 1 & 0 \\
0 & 0 & 1 \\
\end{matrix}\right],
\left[\begin{matrix}
1 & 0 & 0 \\
0 & 0 & 1 \\
0 & 1 & 0 \\
\end{matrix}\right],
\left[\begin{matrix}
0 & 1 & 0 \\
1 & 0 & 0 \\
0 & 0 & 1 \\
\end{matrix}\right],
\left[\begin{matrix}
0 & 0 & 1 \\
1 & 0 & 0 \\
0 & 1 & 0 \\
\end{matrix}\right],
\left[\begin{matrix}
0 & 1 & 0 \\
0 & 0 & 1 \\
1 & 0 & 0 \\
\end{matrix}\right],
\left[\begin{matrix}
0 & 0 & 1 \\
0 & 1 & 0 \\
1 & 0 & 0 \\
\end{matrix}\right]
$$

It is obviously same because set is unordered. So that is why I say these permutation make up a group with operation transpose. But why I also say they make up with inverse? Now let's prove a scary theorem: $P^TP = I$.

The first row will transpose to first column and second row will transpose to second column, but just when same row times same column it will get one, so that means only $i = j$ will have one, it is a identity matrix. Q.E.D.

Now we are know all the opertion of matrix, next part we are going to solve a classic problem and leading out the most important concept in linear algebra.

# Elimination

This part is to lead out the most important concept through a classic problem in Lienar Algebra. The classic problem is **Elimination**, Gauss gave us a algorithm to solve it. We can find the four subspace of a matrix from it.

## Pivot

The first things is that elimination seems $n$ equations and $n$ unknowns problem, why it can be solved by matrix? Let's begin with a three equations and three unknowns problem.

$$
\begin{cases}
&& 2x_2 &+& x_3 &= 3 \\
x_1 &-& x_2 &+& 2x_3 &= 2 \\
2x_1 &+& x_2 &+& 3x_3 &= 6
\end{cases}
$$

This cases can be rewritten in below matrix expression

$$
\left[\begin{matrix}
0 & 2 & 1 \\
1 & -1 & 2 \\
2 & 1 & 3
\end{matrix}\right]
\left[\begin{matrix}
x_1 \\ x_2 \\ x_3
\end{matrix}\right]
=
\left[\begin{matrix}
3 \\ 2 \\ 6
\end{matrix}\right]
$$

Check it by yourself. In following article, I will call the first martix $A$, the second matrix(or vector) $x$, and the answer matrix(or vector) $b$. So the equation is in form $Ax=b$. Because of I said right multiplication depend the linear combination coefficient of $A$, so we also can write it in below form:

$$
x_1 \left[\begin{matrix}
0 \\ 1 \\ 2
\end{matrix}\right]
+ x_2 \left[\begin{matrix}
1 \\ -1 \\ 2
\end{matrix}\right]
+ x_3 \left[\begin{matrix}
1 \\ 2 \\ 3
\end{matrix}\right]
= \left[\begin{matrix}
3 \\ 2 \\ 6
\end{matrix}\right]
$$

It seems that those column vectors span a space, this space is called **Column Space**, denote as $C(A)$, so we know $Ax=b$ has solution when $b\in C(A)$. The dimension of this space we can know from elimination process.

Now let me tell you the algorithm process of Gauss' algorithm. First we find a **Pivot**, pivot cannot be zero because zero cannot use to eliminate other rows. Then use pivot let the rows below become zero. That's all, try it. Oh, you also should put the $b$ matrix after $A$, let $b$ change with elimination, we call this matrix **Augmented Martix**.

$$
\left[\begin{array}{ccc|c}
0 & 2 & 1 & 3 \\
1 & -1 & 2 & 2 \\
2 & 1 & 3 & 6
\end{array}\right]
$$

Pivot cannot be zero, switch the row one and two.

$$
\left[\begin{array}{ccc|c}
(1) & -1 & 2 & 2 \\
0 & 2 & 1 & 3 \\
2 & 1 & 3 & 6
\end{array}\right]
$$

Minus row three with two times of row one.

$$
\left[\begin{array}{ccc|c}
(1) & -1 & 2 & 2 \\
0 & (2) & 1 & 3 \\
0 & 3 & -1 & 2
\end{array}\right]
$$

Minus row three with 3/2 times row two.

$$
\left[\begin{array}{ccc|c}
(1) & -1 & 2 & 2 \\
0 & (2) & 1 & 3 \\
0 & 0 & (-\frac{5}{2}) & -\frac{5}{2}
\end{array}\right]
$$

Now we get three pivot, this means that we have three indenpendence columns, so the $C(A)$ is span to a 3-dimension space. The quantity of pivot we called **rank** denoted as $r$, so obviously that $\operatorname{dim} C(A) = r$.

And the left part of this matrix called up triangluar matrix, denote as $U$.

The following operation of elimination is back substitution. We found that the last row we have $-\frac{5}{2} x_3 = -\frac{5}{2}$, so we can know that $x_3 = 1$, then back substitute this value to second row, then get $x_2 = 1, x_1=1$ .

That is the all process of Gauss' Algorithm.

## Column Space

Now we have finished the basic process of elimination, let us go back to the concept we found before, **Column Space**.

We know when a matrix $A$ is

$$
A =
\left[
\begin{array}{cccc}
| & | & & | \\
\bold{a}_1 & \bold{a}_2 & \cdots & \bold{a}_n \\
| & | & & |
\end{array}
\right]
$$

and a vector $x$ is

$$
x =
\left[
\begin{matrix}
x_1 \\
x_2 \\
\vdots \\
x_n
\end{matrix}
\right]
$$

we have known from Matrix Multiplication part that

$$
Ax =
x_1 \bold{a}_1 +
x_2 \bold{a}_2 +
\cdots +
x_n \bold{a}_n
$$

That means the answer of $Ax$ is just a Linear Combination of columns in $A$. So when $x$ can take all possible value, all possible answer of $Ax$ will span to a space, we call this space **Column Space**, denote as $C(A)$.

So we can write

$$
C(A) =
\operatorname{span}
(
\bold{a}_1,
\bold{a}_2,
\ldots,
\bold{a}_n
)
$$

Also we can write it in another form

$$
C(A) =
\{
Ax \mid x \in \R^n
\}
$$

These two forms are same. First one view it from Linear Combination, second one view it from matrix multiplication.

There is a thing should notice. If $A$ is a $m\times n$ matrix, the columns of $A$ have $m$ components, so those vectors are in $\R^m$. That means

$$
C(A) \subseteq \R^m
$$

But $x$ have $n$ components, so $x$ is in $\R^n$. We can write the whole process like

$$
\R^n
\xrightarrow{A}
C(A)
\subseteq
\R^m
$$

This pattern will be important when we learn other three spaces, remember it.

Now come back to equation $Ax = b$. Because $Ax$ can only be the Linear Combination of columns in $A$, if $b$ is not in $C(A)$, there is obviously no $x$ can let $Ax=b$. So $Ax=b$ has solution only when $b$ is in $C(A)$. That means solving a equation also have a geometry meaning: we are checking whether $b$ is in the space which columns of $A$ span.

Then here is another question. Do all columns in $A$ are useful to span $C(A)$? Of course not, because we have learned Independence before, For example

$$
A =
\left[
\begin{matrix}
1 & 0 & 1 \\
0 & 1 & 1
\end{matrix}
\right]
$$

There are three columns

$$
\bold{a}_1 =
\left[
\begin{matrix}
1 \\
0
\end{matrix}
\right]
\quad
\bold{a}_2 =
\left[
\begin{matrix}
0 \\
1
\end{matrix}
\right]
\quad
\bold{a}_3 =
\left[
\begin{matrix}
1 \\
1
\end{matrix}
\right]
$$

But $\bold{a}_3 =\bold{a}_1 +\bold{a}_2$, So $\bold{a}_3$ is not independence with first two columns, remove it will not change $C(A)$.

We need find a basis of $C(A)$, and the answer have already appeared in Elimination: **Pivot Column**.

If after elimination the pivot appear at column $1,3,5$, that means the column $1,3,5$ are independence with each other and other columns can be Linear Combination from them. So these columns make up a basis of $C(A)$.

But there is a common mistake: we should take column $1,3,5$ from original matrix $A$, not from the matrix after elimination. Because row operation will change columns, so generally $C(A) \neq C(U)$.

Elimination just tell us which column position are pivot, then we go back to original $A$ to get them.

Now remember the definition of rank before. Rank is the quantity of pivot, and now pivot columns form a basis of $C(A)$. The dimension of a space is the size of its basis, so we get $\operatorname{rank}(A) =\operatorname{dim} C(A)$.

That give out a more important meaning of rank. Rank is not just how many pivot we find, it is also how many independence directions this matrix columns can give.

For a matrix whose columns are in $\R^3$, if $\operatorname{rank}(A) = 1$, then $C(A)$ is a line through origin. If $\operatorname{rank}(A) = 2$, then $C(A)$ is a plane through origin. And if $\operatorname{rank}(A) = 3$, then $C(A) = \R^3$. I already said it before, it is the geometry meaning of rank.

Because $C(A)$ is in $\R^m$, its dimension cannot bigger than $m$, and because $A$ only have $n$ columns, it also cannot bigger than $n$. So $\operatorname{rank}(A)\le \min(m,n)$.

## Inverse

We have already known the basic concept of **Inverse** in Matrix part. Now after Elimination, we can use it to calculate inversre of a matrix. Why inverse is useful? Look at equation $Ax = b$. If $A^{-1}$ exist, we can left multiply $A^{-1}$ on both side $A^{-1} Ax =A^{-1} b$. Because $A^{-1} A = I$, we get $x = A^{-1} b$. So inverse can directly give out the answer of equation.

But not all square matrix can be inversed. Now Rank can tell us when it can.

For a $n\times n$ matrix, if $\operatorname{rank}(A) = n$ then it have $n$ pivots, so elimination can finally change $A$ into $I$. Also from Column Space we know every $b$ have solution when $C(A) = \R^n$.

And because every column have pivot, there will be no free variable, so every $b$ also have only one solution.

We can also use Elimination to calculate inverse.

Think we want find a matrix $A^{-1}$ satisfy $A^{-1} A = I$. If we use row operations change $A$ to $I$, all those row operations together are exactly changing $I$ to $A^{-1}$. So we put $I$ after $A$ just like Augmented Matrix in Gauss' Algorithm. For example, start with

$$
\left[
\begin{array}{cc|cc}
1 & 2 & 1 & 0 \\
3 & 4 & 0 & 1
\end{array}
\right]
$$

Minus row two with three times row one

$$
\left[
\begin{array}{cc|cc}
1 & 2 & 1 & 0 \\
0 & -2 & -3 & 1
\end{array}
\right]
$$

Divide row two by $-2$

$$
\left[
\begin{array}{cc|cc}
1 & 2 & 1 & 0 \\
0 & 1 & \frac{3}{2} & -\frac{1}{2}
\end{array}
\right]
$$

Minus row one with two times row two

$$
\left[
\begin{array}{cc|cc}
1 & 0 & -2 & 1 \\
0 & 1 & \frac{3}{2} & -\frac{1}{2}
\end{array}
\right]
$$

So

$$
A^{-1} =
\left[
\begin{matrix}
-2 & 1 \\
\frac{3}{2} & -\frac{1}{2}
\end{matrix}
\right]
$$

You can multiply $A^{-1}A$ to check it by yourself. Now there is a interesting question: we said every row operation can be described by left multiplication, so can we write every step of Elimination as a matrix?

Of course can, that is next concept.

## Elimination Matrix

We have learned before that left-multiplication control the rows of matrix. So every row operation in Elimination can also be written as left multiply a matrix. We call such matrix **Elimination Matrix**. For example, 

$$
A =
\left[
\begin{matrix}
2 & 1 \\
6 & 4
\end{matrix}
\right]
$$

To eliminate $A_{2,1}$, we need $R_2 = R_2 - 3R_1$, from left-multiplication part, we know that we can change the second row of $I$ to coefficients we want

$$
E =
\left[
\begin{matrix}
1 & 0 \\
-3 & 1
\end{matrix}
\right]
$$

Then

$$
EA =
\left[
\begin{matrix}
1 & 0 \\
-3 & 1
\end{matrix}
\right]
\left[
\begin{matrix}
2 & 1 \\
6 & 4
\end{matrix}
\right]
=
\left[
\begin{matrix}
2 & 1 \\
0 & 1
\end{matrix}
\right]
$$

So $E$ just finish the row operation.

If we have many elimination operations, we have many Elimination Matrices

$$
E_1
\quad
E_2
\quad
\ldots
\quad
E_k
$$

and the whole elimination process can write as

$$
E_k
\cdots
E_2
E_1
A
=
U
$$

There is another easy pattern. Because $E$ makes $R_2 = R_2 - 3R_1$, its inverse should make $R_2 = R_2 + 3R_1$, so

$$
E^{-1} =
\left[
\begin{matrix}
1 & 0 \\
3 & 1
\end{matrix}
\right]
$$

In this simple elimination matrix, inverse just change the sign of number below diagonal. This connection is very important because now we can rewrite the whole elimination process backward.

And that will give out **LU Factorization**.

## PA = LU

We have the elimination form with elimination matrix. Left multiply inverse matrices in reverse order, we get

$$
A =
E_1^{-1}
E_2^{-1}
\cdots
E_k^{-1}
U
$$

Let

$$
L =
E_1^{-1}
E_2^{-1}
\cdots
E_k^{-1}
$$

then

$$
A = LU
$$

This is called **LU Factorization**, $L$ is for Lower Triangular Matrix. 

Let us do a example

$$
A =
\left[
\begin{matrix}
2 & 1 & 1 \\
4 & -6 & 0 \\
-2 & 7 & 2
\end{matrix}
\right]
$$

First eliminate first column, $R_2 = R_2 - 2R_1$ and $R_3 = R_3 + R_1$. Then eliminate second column $R_3 = R_3 + R_2$, Finally we get

$$
U =
\left[
\begin{matrix}
2 & 1 & 1 \\
0 & -8 & -2 \\
0 & 0 & 1
\end{matrix}
\right]
$$

The multipliers we used are $2, -1, -1$, put them into the positions below diagonal, then we get

$$
L =
\left[
\begin{matrix}
1 & 0 & 0 \\
2 & 1 & 0 \\
-1 & -1 & 1
\end{matrix}
\right]
$$

And we can check $A = LU$. This is a very useful way to remember $L$: the number we used to eliminate each position can directly put into corresponding position of $L$.

But there is one problem. What if elimination need switch row?

You can remember the example we used before, its first pivot is zero, so we switched row one and row two. Row switching is not an elimination matrix, we have already made a special matrix for it: **Permutation Matrix**.

So if row switching happened, generally we use $PA = LU$, that is called **PLU Factorization**.

Now we have almost finished the calculation side of elimination. Let us come back to $Ax=0$, because it will give out the second space of $A$.

## Null Space

Before we always solve $Ax = b$, now let $b$ become zero vector $Ax = \bold{0}$. The set of all $x$ which satisfy this equation is called **Null Space**, denote as $N(A)$. That means $N(A) =\{x \mid Ax = \bold{0}\}$.

Notice the difference with Column Space. If $A$ is a $m\times n$ matrix, Column Space is in $\R^m$, but $x$ have $n$ components, so $N(A) \subseteq \R^n$. That means Column Space and Null Space are even not in same whole space generally.

Let us find a example which have non-zero vector in Null Space

$$
A =
\left[
\begin{matrix}
1 & 2 & 3 & 4 \\
0 & 1 & 1 & 1 \\
1 & 3 & 4 & 5
\end{matrix}
\right]
$$

We eliminate it

$$
U =
\left[
\begin{matrix}
1 & 2 & 3 & 4 \\
0 & 1 & 1 & 1 \\
0 & 0 & 0 & 0
\end{matrix}
\right]
$$

There are two pivots, we have $4$ variables, but just $2$ pivot variables. So the other two variables are free variables. Let $x_3 = s, x_4 = t$, back substitution. From second row $x_2 + x_3 + x_4 = 0$, so $x_2 = -s-t$. From first row $x_1 + 2x_2 + 3x_3 + 4x_4 = 0$, so $x_1 = -s-2t$. Then all solution can write as

$$
x =
\left[
\begin{matrix}
-s-2t \\
-s-t \\
s \\
t
\end{matrix}
\right]
$$

Use linear combination to write this expression,

$$
x =
s
\left[
\begin{matrix}
-1 \\
-1 \\
1 \\
0
\end{matrix}
\right]
+
t
\left[
\begin{matrix}
-2 \\
-1 \\
0 \\
1
\end{matrix}
\right]
$$

So

$$
N(A) =
\operatorname{span}
\left(
\left[
\begin{matrix}
-1 \\
-1 \\
1 \\
0
\end{matrix}
\right]
,
\left[
\begin{matrix}
-2 \\
-1 \\
0 \\
1
\end{matrix}
\right]
\right)
$$

These two vectors are independence, so they form a basis of $N(A)$.

We have $n=4$ columns and $r=2$ pivots, so there are $2$ free variables. Every free variable give out one special solution, so $\operatorname{dim} N(A) = n-r$. This formula is very important.

There is also a useful nature from Elimination. Row operations do not change solution of $Ax = \bold{0}$, or elimination become wrong. It means that row elimination will not change Null Space, so $N(A) = N(U)$.

That is different with Column Space. We have learned row operation usually change $C(A)$, but it does not change $N(A)$.

But a matrix actually have four important spaces. To find another two, we need use Transpose we have introduced before.

# Four Subspaces

This part I will tell all the subspaces of matrix and show there connections.

## Column Space of Transpose

We have already learned Transpose before. For a $m\times n$ matrix $A$, $A^T$ is a $n\times m$ matrix. Of course $A^T$ have its Column Space $C(A^T)$. But columns of $A^T$ are rows of $A$ after we write them as column vectors. So $C(A^T)$ is also called **Row Space** of $A$.

For example

$$
A =
\left[
\begin{matrix}
1 & 2 & 3 \\
2 & 4 & 6
\end{matrix}
\right]
$$

then

$$
A^T =
\left[
\begin{matrix}
1 & 2 \\
2 & 4 \\
3 & 6
\end{matrix}
\right]
$$

So

$$
C(A^T) =
\operatorname{span}
\left(
\left[
\begin{matrix}
1 \\
2 \\
3
\end{matrix}
\right]
,
\left[
\begin{matrix}
2 \\
4 \\
6
\end{matrix}
\right]
\right)
$$

But second vector is two times first vector, so this row space are a line through origin.

Now there is a very important theorem: $\operatorname{dim} C(A^T)=\operatorname{dim} C(A)$. Becasue transpose obviously don't change the pivot quantity when Elimination, and also row operations do not change $C(A^T)$.

If $A$ is $m\times n$, every row of $A$ have $n$ components, so $C(A^T) \subseteq \R^n$. This is same whole space with $N(A)$.

It seems that $C(A^T)$ has more connection with $N(A)$.

## Null Space of Transpose

Now just like what we did before, $A^T$ also have a Null Space $N(A^T)$. Its definition is $N(A^T) =\{y \mid A^Ty = \bold{0}\}$, because $A^T$ is $n\times m$, the vector $y$ have $m$ components, so $N(A^T) \subseteq \R^m$. This is same whole space with $C(A)$.

We can find its dimension using same formula of Null Space. The rank of $A^T$ is also $r$, and $A^T$ have $m$ columns, so $\operatorname{dim} N(A^T) = m-r$ So now we finally have all four spaces, $C(A), N(A), C(A^T), N(A^T)$.

Let us use the matrix in Null Space example again

$$
A =
\left[
\begin{matrix}
1 & 2 & 3 & 4 \\
0 & 1 & 1 & 1 \\
1 & 3 & 4 & 5
\end{matrix}
\right]
$$

We know rank of this matrix is two, and $A$ is $3\times4$, so $\operatorname{dim} C(A) = 2$, $\operatorname{dim} N(A) = 2$, $\operatorname{dim} C(A^T) = 2$, $\operatorname{dim} N(A^T) = 1$. We can also calculate last space directly.

Because third row of $A$ is first row plus second row, if

$$
y =
\left[
\begin{matrix}
-1 \\
-1 \\
1
\end{matrix}
\right]
$$

then

$$
A^Ty = \bold{0}
$$

So

$$
N(A^T) =
\operatorname{span}
\left(
\left[
\begin{matrix}
-1 \\
-1 \\
1
\end{matrix}
\right]
\right)
$$

Now the last thing we need is put these four spaces together.

## Four Fundamental Subspaces

We have found four spaces from one matrix

$$
C(A)
\quad
N(A)
\quad
C(A^T)
\quad
N(A^T)
$$

They are called **Four Fundamental Subspaces**.

We can summarize all things into below table:

| Space    | In     | Dimension | Meaning                              |
| -------- | ------ | --------- | ------------------------------------ |
| $C(A)$   | $\R^m$ | $r$       | All possible output of $Ax$          |
| $N(A)$   | $\R^n$ | $n-r$     | Input which $A$ change to zero       |
| $C(A^T)$ | $\R^n$ | $r$       | Space spanned by rows of $A$         |
| $N(A^T)$ | $\R^m$ | $m-r$     | Vectors orthogonal with Column Space |

But the connection is not just their dimensions add to whole space. Remember the Orthogonality we learned in Vector part. Take any $x \in N(A)$, then $Ax = \bold{0}$.

What does this equation mean by rows? Every row of $A$ dot product with $x$ equal zero. So $x$ is orthogonal with every row of $A$, and of course also orthogonal with every Linear Combination of rows. But all Linear Combination of rows make up $C(A^T)$. So $C(A^T) \perp N(A)$.

And because their dimensions together equal $n$, they fill the whole $\R^n$.

So

$$
\R^n =
C(A^T)
\oplus
N(A)
$$

Same pattern happened in $\R^m$.

$$
C(A) \perp N(A^T)
$$

and their dimensions together equal $m$, so

$$
\R^m =
C(A)
\oplus
N(A^T)
$$

Now we can finally understand the four rectangles diagram in Linear Algebra.

![](https://cdn.luogu.com.cn/upload/image_hosting/ao8n47gt.png)

The left whole space is $\R^n$. It contains $C(A^T)$ and $N(A)$. The right whole space is $\R^m$. It contains $C(A)$ and $N(A^T)$. Also the two pair of spaces are orthogonal, that why these irregular quadrilateral seems vertical on their intersection

$$
C(A^T) \perp N(A)\\
C(A) \perp N(A^T)
$$

That's all, thanks for reading.