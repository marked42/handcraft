# handcraft

1. jest 支持 typescript， @types/jest 包为提供类型声明，如何为指定文件添加类型声明，因为只有测试文件才需要，普通文件中不需要 test 相关的类型声明。

手写解析的注意点

1. 区分 peek/next/ expect 的操作
1. 注意消耗输出进行状态转移的时候记得调用 next
