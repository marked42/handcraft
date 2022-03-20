# 介绍

Eva 是课程[Building an Interpreter from scratch](https://www.bilibili.com/video/BV1XZ4y1k7T7)中 Eva 语言解释器的 Typescript 实现版本。

功能列表

1. 基础的值与表达式类型 数字、字符串、布尔值
1. 数学运算
1. 全局作用域 变量支持，读取与写入
    1. 变量定义，不允许重复定义
    1. 变量读取，读取不存在变量报错
    1. 变量写入，写入不存在变量报错，写入只读变量报错
    1. 变量初始化之前读取，在编译时报错
1. 块级作用域、局部作用域 嵌套的环境支持 Environment/EnvironmentRecord
    1. 包含多条语句
    1. 返回值是最后一条语句
    1. 嵌套作用域
        1. 在内层可以读写外层变量
        1. 内层变量可以定义与外层变量同名的变量
        1. 内层变量覆盖同名外层变量
1. 函数

Typescript

1. import from an auto generate ES5 commonjs file
