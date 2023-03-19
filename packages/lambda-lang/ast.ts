export interface AstNum {
    type: "num";
    value: number;
}

export interface AstStr {
    type: "str";
    value: string;
}

export interface AstBool {
    type: "bool";
    value: boolean;
}

export interface AstVar {
    type: "var";
    value: string;
}

export interface AstLambda {
    type: "lambda";
    vars: string[];
    body: AST;
}

export interface AstCall {
    type: "call";
    func: AST;
    args: AST[];
}

export interface AstIf {
    type: "if";
    cond: AST;
    then: AST;
    else?: AST;
}

export interface AstAssign {
    type: "assign";
    operator: "=";
    left: AST;
    right: AST;
}

export interface AstBinary {
    type: "binary";
    operator: string;
    left: AST;
    right: AST;
}

export interface AstProg {
    type: "prog";
    prog: AST[];
}

export interface AstLet {
    type: "let";
    vars: Array<{ name: string; def: AST }>;
    body: AST;
}

export type AST =
    | AstNum
    | AstStr
    | AstBool
    | AstVar
    | AstLambda
    | AstCall
    | AstIf
    | AstAssign
    | AstBinary
    | AstProg
    | AstLet;
