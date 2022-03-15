import {
	TokenStream,
	TokenType,
	StringToken,
	BooleanToken,
	NumberToken,
} from "./TokenStream";

export class JSONParser {
	readonly tokenStream: TokenStream;

	constructor(private readonly text: string) {
		this.tokenStream = new TokenStream(text);
	}

	parseObject() {
		const object: Record<string, any> = {};

		this.tokenStream.consumeToken(TokenType.LeftParenthesis);

		if (this.tokenStream.peekToken().type === TokenType.RightParenthesis) {
			this.tokenStream.consumeToken();
			return object;
		}

		const consumeMember = () => {
			const nextToken = this.tokenStream.peekToken();
			if (nextToken.type !== TokenType.String) {
				throw new Error(
					`unexpected token ${nextToken.type} at index ${this.tokenStream.index} from input ${this.text}, object member should start with string.`
				);
			}
			this.tokenStream.consumeToken();
			this.tokenStream.consumeToken(TokenType.Colon);
			const value = this.parseValue();

			object[nextToken.value] = value;
		};

		consumeMember();
		while (this.tokenStream.peekToken().type === TokenType.Comma) {
			this.tokenStream.consumeToken();
			consumeMember();
		}

		this.tokenStream.consumeToken(TokenType.RightParenthesis);

		return object;
	}

	parseString() {
		const token = this.tokenStream.consumeToken(TokenType.String);

		// TODO: expectToken should narrow token to StringToken type
		return (token as StringToken).value;
	}

	parseBoolean() {
		const token = this.tokenStream.consumeToken(TokenType.Boolean);

		return (token as BooleanToken).value;
	}

	parseNull() {
		this.tokenStream.consumeToken(TokenType.Null);

		return null;
	}

	parseArray() {
		this.tokenStream.consumeToken(TokenType.LeftSquareBracket);
		// TODO: json value typing
		const result: any[] = [];

		if (
			this.tokenStream.peekToken().type === TokenType.RightSquareBracket
		) {
			this.tokenStream.consumeToken();
			return result;
		}

		const consumeElement = () => {
			const element = this.parseValue();
			result.push(element);
		};
		consumeElement();

		while (this.tokenStream.peekToken().type === TokenType.Comma) {
			this.tokenStream.consumeToken();

			consumeElement();
		}

		this.tokenStream.consumeToken(TokenType.RightSquareBracket);

		return result;
	}

	parseNumber() {
		// TODO: type narrowing
		const token = this.tokenStream.consumeToken(
			TokenType.Number
		) as NumberToken;

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

		if (this.tokenStream.peekToken().type !== TokenType.EOF) {
			throw new Error(
				`unexpected token at index ${this.tokenStream.index}, input should end here`
			);
		}

		return value;
	}

	parseValue() {
		const token = this.tokenStream.peekToken();

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
				throw new Error(
					`unexpected input ${this.text} at index ${this.tokenStream.index}`
				);
		}

		return value;
	}
}
