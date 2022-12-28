import { Context } from "./context";
import {
    ExpressionType,
    Expression,
    createProcedure,
    assertSymbolList,
    ListExpression,
    SymbolExpression,
    isTruthy,
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
        const [test, consequent, alternate] = args;

        return isTruthy(interpretExpression(test, context))
            ? interpretExpression(consequent, context)
            : interpretExpression(alternate, context);
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
    quote: (args: Expression[]) => {
        if (args.length !== 1) {
            throw new Error(
                `quote accepts only 1 argument, get ${args.length} ${format(
                    args
                )}`
            );
        }
        return args[0];
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
