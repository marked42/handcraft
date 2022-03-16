import { TokenStream } from "./TokenStream";
import {
	Token,
	TokenType,
	StringToken,
	BooleanToken,
	NumberToken,
} from "./Token";

export class JSONParser {
	constructor(private readonly tokenStream: TokenStream) {}

	parseObject() {
		const object: Record<string, any> = {};

		this.tokenStream.eat(TokenType.LeftParenthesis);

		if (this.tokenStream.peek().type === TokenType.RightParenthesis) {
			this.tokenStream.eat();
			return object;
		}

		const consumeMember = () => {
			const nextToken = this.tokenStream.peek() as StringToken;
			if (nextToken.type !== TokenType.String) {
				this.reportUnexpectedToken(
					nextToken,
					"Object member should start with string."
				);
			}
			this.tokenStream.eat();
			this.tokenStream.eat(TokenType.Colon);
			const value = this.parseValue();

			object[nextToken.value] = value;
		};

		consumeMember();
		while (this.tokenStream.peek().type === TokenType.Comma) {
			this.tokenStream.eat();
			consumeMember();
		}

		this.tokenStream.eat(TokenType.RightParenthesis);

		return object;
	}

	parseString() {
		const token = this.tokenStream.eat(TokenType.String);

		// TODO: expectToken should narrow token to StringToken type
		return (token as StringToken).value;
	}

	parseBoolean() {
		const token = this.tokenStream.eat(TokenType.Boolean);

		return (token as BooleanToken).value;
	}

	parseNull() {
		this.tokenStream.eat(TokenType.Null);

		return null;
	}

	parseArray() {
		this.tokenStream.eat(TokenType.LeftSquareBracket);
		// TODO: json value typing
		const result: any[] = [];

		if (this.tokenStream.peek().type === TokenType.RightSquareBracket) {
			this.tokenStream.eat();
			return result;
		}

		const consumeElement = () => {
			const element = this.parseValue();
			result.push(element);
		};
		consumeElement();

		while (this.tokenStream.peek().type === TokenType.Comma) {
			this.tokenStream.eat();

			consumeElement();
		}

		this.tokenStream.eat(TokenType.RightSquareBracket);

		return result;
	}

	parseNumber() {
		// TODO: type narrowing
		const token = this.tokenStream.eat(TokenType.Number) as NumberToken;

		return token.value;
	}

	/**
	 * 为了处理单个数字是非法的情况 00
	 * 区分parse和parseValue，
	 * parseValue解析成功后，后续还可以有输入
	 * parse解析成功后，输入必须完结
	 *
	 * 一个token那个字符开始到那个字符结束
	 * 1. 最长规则？
	 * 2. 错误形式，明确token边界的话方便检测错误形式，给出友好的报错信息
	 *
	 * 考虑非递归实现，迭代实现中，如果解析结束后，栈内有多个json值，则输入非法
	 */
	parse() {
		const value = this.parseValue();

		const token = this.tokenStream.peek();
		if (token.type !== TokenType.EOF) {
			this.reportUnexpectedToken(token, "Input should end here.");
		}

		return value;
	}

	parseValue() {
		const token = this.tokenStream.peek();

		// TODO: typing JSON
		let value: any;
		switch (token.type) {
			case TokenType.Boolean:
				value = this.parseBoolean();
				break;

			case TokenType.Null:
				value = this.parseNull();
				break;

			case TokenType.String:
				value = this.parseString();
				break;

			case TokenType.LeftParenthesis:
				value = this.parseObject();
				break;

			case TokenType.LeftSquareBracket:
				value = this.parseArray();
				break;

			case TokenType.Number:
				value = this.parseNumber();
				break;

			default:
				this.reportUnexpectedToken(token);
		}

		return value;
	}

	reportUnexpectedToken(token: Token, message: string = "") {
		throw new Error(
			`Unexpected token ${token.type} at position ${this.tokenStream.characterIndex} in JSON. ${message}`
		);
	}
}
