TemplateParser = function(data, template)
{
	var feedData = data;
	var htmlTemplate = template;
	var yieldCode = new Array();
	function init()
	{
		yieldCode.push('var re = function(data){ var code = new Array();');
	}
	function emitHtml(source)
	{
		yieldCode.push('code.push(\'' + source.replace(/'/g, '\\\'') + '\');');
	}
	function emitJs(source)
	{
		yieldCode.push(source);
	}
	function emitAssignment(source)
	{
		yieldCode.push('code.push(' + source + ');');
	}
	this.parse = function()
	{
		var lexer = new Lexer(htmlTemplate);
		var token = null;
		while ((token = lexer.scan()).type != TokenType.END)
		{
			switch (token.type) {
				case TokenType.HTML:
					emitHtml(token.value);
					break;
				case TokenType.JS:
					emitJs(token.value);
					break;
				case TokenType.ASSIGNMENT:
					emitAssignment(token.value);
					break;
				case TokenType.ERROR:
				default:
					return 'Error occured! Check the syntax at char : '
							+ token.value;
			}
		}
		yieldCode.push('return code.join("");}(data);');
		eval(yieldCode.join(''));
		return re;
	};
	init();
	function Lexer(source)
	{
		var index = 0;
		var sourceLength = source.length;
		var source = source;
		this.scan = function()
		{
			var beginIndex = index;
			var context = TokenType.BEGIN;
			for ( var i = index; i < sourceLength; i++)
			{
				switch (context) {
				case TokenType.BEGIN:
					if (source.charAt(i) == '<' && source.charAt(i + 1) == '#'
							&& source.charAt(i + 2) == '=')
					{
						context = TokenType.ASSIGNMENT;
						beginIndex = i = i + 3;
					} else if (source.charAt(i) == '<'
							&& source.charAt(i + 1) == '#')
					{
						context = TokenType.JS;
						beginIndex = i = i + 2;
					} else
					{
						context = TokenType.HTML;
					}
					break;
				case TokenType.ASSIGNMENT:
				case TokenType.JS:
					if (source.charAt(i) == '#' && source.charAt(i + 1) == '>')
					{
						var token = new Token(context, source.substr(
								beginIndex, i - beginIndex));
						index = i + 2;
						return token;
					}
					break;
				case TokenType.HTML:
					if ((source.charAt(i) == '<' && source.charAt(i + 1) == '#'))
					{
						index = i;
						return new Token(context, source.substr(beginIndex, i
								- beginIndex));
					} else if (i + 1 == sourceLength)
					{
						index = i;
						return new Token(context, source.substr(beginIndex, i
								- beginIndex + 1));
					}
					break;
				default:
					return new Token(TokenType.ERROR, i);
					break;
				}
			}
			return new Token(TokenType.END);
		};
		return this;
	}
	var TokenType = {
		BEGIN : 0,
		HTML : 1,
		JS : 2,
		ASSIGNMENT : 3,
		END : 4,
		ERROR : 5
	};
	function Token(tokenType, tokenValue)
	{
		this.type = tokenType;
		this.value = tokenValue;
	}
}​