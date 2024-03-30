// Generated from PropositionalLogic.g4 by ANTLR 4.13.1
// jshint ignore: start
import antlr4 from 'antlr4';


const serializedATN = [4,0,13,88,6,-1,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,
4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,
12,1,0,1,0,1,1,4,1,31,8,1,11,1,12,1,32,1,1,1,1,1,2,3,2,38,8,2,1,2,1,2,3,
2,42,8,2,1,2,1,2,1,3,1,3,1,3,3,3,49,8,3,1,4,1,4,1,4,1,4,3,4,55,8,4,1,5,1,
5,1,5,3,5,60,8,5,1,6,1,6,1,6,3,6,65,8,6,1,7,1,7,1,8,1,8,1,9,1,9,1,10,4,10,
74,8,10,11,10,12,10,75,1,10,4,10,79,8,10,11,10,12,10,80,3,10,83,8,10,1,11,
1,11,1,12,1,12,0,0,13,1,1,3,2,5,3,7,4,9,5,11,6,13,7,15,8,17,9,19,10,21,11,
23,12,25,13,1,0,4,2,0,9,9,32,32,3,0,33,33,126,126,172,172,2,0,65,90,97,122,
1,0,945,969,97,0,1,1,0,0,0,0,3,1,0,0,0,0,5,1,0,0,0,0,7,1,0,0,0,0,9,1,0,0,
0,0,11,1,0,0,0,0,13,1,0,0,0,0,15,1,0,0,0,0,17,1,0,0,0,0,19,1,0,0,0,0,21,
1,0,0,0,0,23,1,0,0,0,0,25,1,0,0,0,1,27,1,0,0,0,3,30,1,0,0,0,5,41,1,0,0,0,
7,48,1,0,0,0,9,54,1,0,0,0,11,59,1,0,0,0,13,64,1,0,0,0,15,66,1,0,0,0,17,68,
1,0,0,0,19,70,1,0,0,0,21,82,1,0,0,0,23,84,1,0,0,0,25,86,1,0,0,0,27,28,5,
44,0,0,28,2,1,0,0,0,29,31,7,0,0,0,30,29,1,0,0,0,31,32,1,0,0,0,32,30,1,0,
0,0,32,33,1,0,0,0,33,34,1,0,0,0,34,35,6,1,0,0,35,4,1,0,0,0,36,38,5,13,0,
0,37,36,1,0,0,0,37,38,1,0,0,0,38,39,1,0,0,0,39,42,5,10,0,0,40,42,5,13,0,
0,41,37,1,0,0,0,41,40,1,0,0,0,42,43,1,0,0,0,43,44,6,2,0,0,44,6,1,0,0,0,45,
46,5,61,0,0,46,49,5,62,0,0,47,49,5,8658,0,0,48,45,1,0,0,0,48,47,1,0,0,0,
49,8,1,0,0,0,50,51,5,60,0,0,51,52,5,61,0,0,52,55,5,62,0,0,53,55,5,8660,0,
0,54,50,1,0,0,0,54,53,1,0,0,0,55,10,1,0,0,0,56,57,5,124,0,0,57,60,5,124,
0,0,58,60,5,8744,0,0,59,56,1,0,0,0,59,58,1,0,0,0,60,12,1,0,0,0,61,62,5,38,
0,0,62,65,5,38,0,0,63,65,5,8743,0,0,64,61,1,0,0,0,64,63,1,0,0,0,65,14,1,
0,0,0,66,67,7,1,0,0,67,16,1,0,0,0,68,69,5,40,0,0,69,18,1,0,0,0,70,71,5,41,
0,0,71,20,1,0,0,0,72,74,7,2,0,0,73,72,1,0,0,0,74,75,1,0,0,0,75,73,1,0,0,
0,75,76,1,0,0,0,76,83,1,0,0,0,77,79,7,3,0,0,78,77,1,0,0,0,79,80,1,0,0,0,
80,78,1,0,0,0,80,81,1,0,0,0,81,83,1,0,0,0,82,73,1,0,0,0,82,78,1,0,0,0,83,
22,1,0,0,0,84,85,2,8868,8869,0,85,24,1,0,0,0,86,87,5,8866,0,0,87,26,1,0,
0,0,11,0,32,37,41,48,54,59,64,75,80,82,1,6,0,0];


const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map( (ds, index) => new antlr4.dfa.DFA(ds, index) );

export default class PropositionalLogicLexer extends antlr4.Lexer {

    static grammarFileName = "PropositionalLogic.g4";
    static channelNames = [ "DEFAULT_TOKEN_CHANNEL", "HIDDEN" ];
	static modeNames = [ "DEFAULT_MODE" ];
	static literalNames = [ null, "','", null, null, null, null, null, null, 
                         null, "'('", "')'", null, null, "'\\u22A2'" ];
	static symbolicNames = [ null, null, "WS", "NEWLINE", "IMPLICATION", "EQUIVALENCE", 
                          "DISJUNCTION", "CONJUNCTION", "NEGATION", "LPAR", 
                          "RPAR", "VARIABLE", "CONSTANT", "SEQUENT" ];
	static ruleNames = [ "T__0", "WS", "NEWLINE", "IMPLICATION", "EQUIVALENCE", 
                      "DISJUNCTION", "CONJUNCTION", "NEGATION", "LPAR", 
                      "RPAR", "VARIABLE", "CONSTANT", "SEQUENT" ];

    constructor(input) {
        super(input)
        this._interp = new antlr4.atn.LexerATNSimulator(this, atn, decisionsToDFA, new antlr4.atn.PredictionContextCache());
    }
}

PropositionalLogicLexer.EOF = antlr4.Token.EOF;
PropositionalLogicLexer.T__0 = 1;
PropositionalLogicLexer.WS = 2;
PropositionalLogicLexer.NEWLINE = 3;
PropositionalLogicLexer.IMPLICATION = 4;
PropositionalLogicLexer.EQUIVALENCE = 5;
PropositionalLogicLexer.DISJUNCTION = 6;
PropositionalLogicLexer.CONJUNCTION = 7;
PropositionalLogicLexer.NEGATION = 8;
PropositionalLogicLexer.LPAR = 9;
PropositionalLogicLexer.RPAR = 10;
PropositionalLogicLexer.VARIABLE = 11;
PropositionalLogicLexer.CONSTANT = 12;
PropositionalLogicLexer.SEQUENT = 13;



