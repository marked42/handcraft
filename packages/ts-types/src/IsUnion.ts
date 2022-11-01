type IsUnion<T, C = T> = T extends C ? ([C] extends [T] ? false : true) : never;
