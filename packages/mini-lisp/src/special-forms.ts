import { Context } from "./context";
import {
    ExpressionType,
    Expression,
    createProcedure,
    assertSymbolList,
    ListExpression,
    SymbolExpression,
} from "./expression";
import { interpretExpression } from "./interpreter";
import { format } from "./utils";

interface SpecialForm {
    (args: Expression[], context: Context): Expression;
}

export const SpecialForms: Record<string, SpecialForm> = {
    if: (args: Expression[], context: Context) => {
        if (args.length !== 3) {
            throw new Error(`if accepts 3 arguments, get ${format(args)}`);
        }
        const [test, consequent, alternate] = args.map((e) =>
            interpretExpression(e, context)
        );

        // FIXME: conform to spec
        const isTruthy = (expr: Expression) => {
            switch (expr.type) {
                case ExpressionType.Boolean:
                    return expr.value;
                case ExpressionType.Number:
                    return expr.value !== 0;
                case ExpressionType.List:
                    return expr.items.length > 0;
                default:
                    throw new Error("invalid case");
            }
        };

        return isTruthy(test) ? consequent : alternate;
    },
    define: (args: Expression[], context: Context) => {
        if (args.length !== 2) {
            throw new Error(`define accepts 2 parameters, get ${args.length}`);
        }

        // do not evaluate variable, not defined yet.
        const [variable, init] = args;
        if (variable.type !== ExpressionType.Symbol) {
            throw new Error(
                `define requires first parameter to be symbol, get ${format(
                    variable
                )}`
            );
        }
        const value = interpretExpression(init, context);
        context.define(variable.name, value);

        return value;
    },
    "set!": (args: Expression[], context: Context) => {
        if (args.length !== 2) {
            throw new Error(`set! accepts 2 parameters, get ${args.length}`);
        }

        // do not evaluate variable
        const [variable, init] = args;
        if (variable.type !== ExpressionType.Symbol) {
            throw new Error(
                `set! requires first parameter to be symbol, get ${format(
                    variable
                )}`
            );
        }
        const value = interpretExpression(init, context);
        context.set(variable.name, value);

        return value;
    },
    lambda: (args: Expression[], context: Context) => {
        if (args.length !== 2) {
            throw new Error(`lambda accepts 2 parameters, get ${format(args)}`);
        }

        const [parameters, body] = args;
        assertSymbolList(parameters);

        return createProcedure((...args: Expression[]) => {
            if (args.length !== parameters.items.length) {
                throw new Error(
                    `lambda accepts ${
                        parameters.items.length
                    } parameters, get ${args.length} ${format(args)}`
                );
            }

            const lambdaContext = createCallContext(context, parameters, args);

            return interpretExpression(body, lambdaContext);
        });
    },
};

function createCallContext(
    context: Context,
    parameters: ListExpression<SymbolExpression>,
    args: Expression[]
) {
    const scope: Record<string, Expression> = {};
    parameters.items.forEach((p, i) => {
        scope[p.name] = args[i];
    });
    return new Context(scope, context);
}
