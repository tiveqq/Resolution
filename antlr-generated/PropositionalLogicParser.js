// Generated from PropositionalLogic.g4 by ANTLR 4.13.1
// jshint ignore: start
import antlr4 from 'antlr4';
import PropositionalLogicVisitor from './PropositionalLogicVisitor.js';

const serializedATN = [4,1,13,87,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,
2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,1,0,1,0,3,0,21,8,0,1,1,1,1,1,1,5,1,26,8,
1,10,1,12,1,29,9,1,1,1,3,1,32,8,1,4,1,34,8,1,11,1,12,1,35,1,2,1,2,1,2,5,
2,41,8,2,10,2,12,2,44,9,2,1,3,1,3,1,3,5,3,49,8,3,10,3,12,3,52,9,3,1,4,1,
4,1,4,5,4,57,8,4,10,4,12,4,60,9,4,1,5,1,5,1,5,3,5,65,8,5,1,6,1,6,1,6,1,6,
1,6,1,6,3,6,73,8,6,1,7,1,7,1,7,1,7,1,8,1,8,1,8,5,8,82,8,8,10,8,12,8,85,9,
8,1,8,0,0,9,0,2,4,6,8,10,12,14,16,0,0,88,0,20,1,0,0,0,2,33,1,0,0,0,4,37,
1,0,0,0,6,45,1,0,0,0,8,53,1,0,0,0,10,64,1,0,0,0,12,72,1,0,0,0,14,74,1,0,
0,0,16,78,1,0,0,0,18,21,3,2,1,0,19,21,3,14,7,0,20,18,1,0,0,0,20,19,1,0,0,
0,21,1,1,0,0,0,22,27,3,4,2,0,23,24,5,5,0,0,24,26,3,4,2,0,25,23,1,0,0,0,26,
29,1,0,0,0,27,25,1,0,0,0,27,28,1,0,0,0,28,31,1,0,0,0,29,27,1,0,0,0,30,32,
5,3,0,0,31,30,1,0,0,0,31,32,1,0,0,0,32,34,1,0,0,0,33,22,1,0,0,0,34,35,1,
0,0,0,35,33,1,0,0,0,35,36,1,0,0,0,36,3,1,0,0,0,37,42,3,6,3,0,38,39,5,4,0,
0,39,41,3,6,3,0,40,38,1,0,0,0,41,44,1,0,0,0,42,40,1,0,0,0,42,43,1,0,0,0,
43,5,1,0,0,0,44,42,1,0,0,0,45,50,3,8,4,0,46,47,5,6,0,0,47,49,3,8,4,0,48,
46,1,0,0,0,49,52,1,0,0,0,50,48,1,0,0,0,50,51,1,0,0,0,51,7,1,0,0,0,52,50,
1,0,0,0,53,58,3,10,5,0,54,55,5,7,0,0,55,57,3,10,5,0,56,54,1,0,0,0,57,60,
1,0,0,0,58,56,1,0,0,0,58,59,1,0,0,0,59,9,1,0,0,0,60,58,1,0,0,0,61,62,5,8,
0,0,62,65,3,12,6,0,63,65,3,12,6,0,64,61,1,0,0,0,64,63,1,0,0,0,65,11,1,0,
0,0,66,67,5,9,0,0,67,68,3,2,1,0,68,69,5,10,0,0,69,73,1,0,0,0,70,73,5,11,
0,0,71,73,5,12,0,0,72,66,1,0,0,0,72,70,1,0,0,0,72,71,1,0,0,0,73,13,1,0,0,
0,74,75,3,16,8,0,75,76,5,13,0,0,76,77,3,2,1,0,77,15,1,0,0,0,78,83,3,2,1,
0,79,80,5,1,0,0,80,82,3,2,1,0,81,79,1,0,0,0,82,85,1,0,0,0,83,81,1,0,0,0,
83,84,1,0,0,0,84,17,1,0,0,0,85,83,1,0,0,0,10,20,27,31,35,42,50,58,64,72,
83];


const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map( (ds, index) => new antlr4.dfa.DFA(ds, index) );

const sharedContextCache = new antlr4.atn.PredictionContextCache();

export default class PropositionalLogicParser extends antlr4.Parser {

    static grammarFileName = "PropositionalLogic.g4";
    static literalNames = [ null, "','", null, null, null, null, null, null, 
                            null, "'('", "')'", null, null, "'\\u22A2'" ];
    static symbolicNames = [ null, null, "WS", "NEWLINE", "IMPLICATION", 
                             "EQUIVALENCE", "DISJUNCTION", "CONJUNCTION", 
                             "NEGATION", "LPAR", "RPAR", "VARIABLE", "CONSTANT", 
                             "SEQUENT" ];
    static ruleNames = [ "logic", "equivalence", "implication", "disjunction", 
                         "conjunction", "negation", "parenthesis", "sequent", 
                         "premiseList" ];

    constructor(input) {
        super(input);
        this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
        this.ruleNames = PropositionalLogicParser.ruleNames;
        this.literalNames = PropositionalLogicParser.literalNames;
        this.symbolicNames = PropositionalLogicParser.symbolicNames;
    }



	logic() {
	    let localctx = new LogicContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 0, PropositionalLogicParser.RULE_logic);
	    try {
	        this.state = 20;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,0,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 18;
	            this.equivalence();
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 19;
	            this.sequent();
	            break;

	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	equivalence() {
	    let localctx = new EquivalenceContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 2, PropositionalLogicParser.RULE_equivalence);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 33; 
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        do {
	            this.state = 22;
	            this.implication();
	            this.state = 27;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            while(_la===5) {
	                this.state = 23;
	                this.match(PropositionalLogicParser.EQUIVALENCE);
	                this.state = 24;
	                this.implication();
	                this.state = 29;
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	            }
	            this.state = 31;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===3) {
	                this.state = 30;
	                this.match(PropositionalLogicParser.NEWLINE);
	            }

	            this.state = 35; 
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        } while((((_la) & ~0x1f) === 0 && ((1 << _la) & 6912) !== 0));
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	implication() {
	    let localctx = new ImplicationContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 4, PropositionalLogicParser.RULE_implication);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 37;
	        this.disjunction();
	        this.state = 42;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===4) {
	            this.state = 38;
	            this.match(PropositionalLogicParser.IMPLICATION);
	            this.state = 39;
	            this.disjunction();
	            this.state = 44;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	disjunction() {
	    let localctx = new DisjunctionContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 6, PropositionalLogicParser.RULE_disjunction);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 45;
	        this.conjunction();
	        this.state = 50;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===6) {
	            this.state = 46;
	            this.match(PropositionalLogicParser.DISJUNCTION);
	            this.state = 47;
	            this.conjunction();
	            this.state = 52;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	conjunction() {
	    let localctx = new ConjunctionContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 8, PropositionalLogicParser.RULE_conjunction);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 53;
	        this.negation();
	        this.state = 58;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===7) {
	            this.state = 54;
	            this.match(PropositionalLogicParser.CONJUNCTION);
	            this.state = 55;
	            this.negation();
	            this.state = 60;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	negation() {
	    let localctx = new NegationContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 10, PropositionalLogicParser.RULE_negation);
	    try {
	        this.state = 64;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 8:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 61;
	            this.match(PropositionalLogicParser.NEGATION);
	            this.state = 62;
	            this.parenthesis();
	            break;
	        case 9:
	        case 11:
	        case 12:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 63;
	            this.parenthesis();
	            break;
	        default:
	            throw new antlr4.error.NoViableAltException(this);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	parenthesis() {
	    let localctx = new ParenthesisContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 12, PropositionalLogicParser.RULE_parenthesis);
	    try {
	        this.state = 72;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 9:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 66;
	            this.match(PropositionalLogicParser.LPAR);
	            this.state = 67;
	            this.equivalence();
	            this.state = 68;
	            this.match(PropositionalLogicParser.RPAR);
	            break;
	        case 11:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 70;
	            this.match(PropositionalLogicParser.VARIABLE);
	            break;
	        case 12:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 71;
	            this.match(PropositionalLogicParser.CONSTANT);
	            break;
	        default:
	            throw new antlr4.error.NoViableAltException(this);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	sequent() {
	    let localctx = new SequentContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 14, PropositionalLogicParser.RULE_sequent);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 74;
	        this.premiseList();

	        this.state = 75;
	        this.match(PropositionalLogicParser.SEQUENT);
	        this.state = 76;
	        this.equivalence();
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	premiseList() {
	    let localctx = new PremiseListContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 16, PropositionalLogicParser.RULE_premiseList);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 78;
	        this.equivalence();
	        this.state = 83;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===1) {
	            this.state = 79;
	            this.match(PropositionalLogicParser.T__0);
	            this.state = 80;
	            this.equivalence();
	            this.state = 85;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}


}

PropositionalLogicParser.EOF = antlr4.Token.EOF;
PropositionalLogicParser.T__0 = 1;
PropositionalLogicParser.WS = 2;
PropositionalLogicParser.NEWLINE = 3;
PropositionalLogicParser.IMPLICATION = 4;
PropositionalLogicParser.EQUIVALENCE = 5;
PropositionalLogicParser.DISJUNCTION = 6;
PropositionalLogicParser.CONJUNCTION = 7;
PropositionalLogicParser.NEGATION = 8;
PropositionalLogicParser.LPAR = 9;
PropositionalLogicParser.RPAR = 10;
PropositionalLogicParser.VARIABLE = 11;
PropositionalLogicParser.CONSTANT = 12;
PropositionalLogicParser.SEQUENT = 13;

PropositionalLogicParser.RULE_logic = 0;
PropositionalLogicParser.RULE_equivalence = 1;
PropositionalLogicParser.RULE_implication = 2;
PropositionalLogicParser.RULE_disjunction = 3;
PropositionalLogicParser.RULE_conjunction = 4;
PropositionalLogicParser.RULE_negation = 5;
PropositionalLogicParser.RULE_parenthesis = 6;
PropositionalLogicParser.RULE_sequent = 7;
PropositionalLogicParser.RULE_premiseList = 8;

class LogicContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = PropositionalLogicParser.RULE_logic;
    }

	equivalence() {
	    return this.getTypedRuleContext(EquivalenceContext,0);
	};

	sequent() {
	    return this.getTypedRuleContext(SequentContext,0);
	};

	accept(visitor) {
	    if ( visitor instanceof PropositionalLogicVisitor ) {
	        return visitor.visitLogic(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class EquivalenceContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = PropositionalLogicParser.RULE_equivalence;
    }

	implication = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ImplicationContext);
	    } else {
	        return this.getTypedRuleContext(ImplicationContext,i);
	    }
	};

	EQUIVALENCE = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(PropositionalLogicParser.EQUIVALENCE);
	    } else {
	        return this.getToken(PropositionalLogicParser.EQUIVALENCE, i);
	    }
	};


	NEWLINE = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(PropositionalLogicParser.NEWLINE);
	    } else {
	        return this.getToken(PropositionalLogicParser.NEWLINE, i);
	    }
	};


	accept(visitor) {
	    if ( visitor instanceof PropositionalLogicVisitor ) {
	        return visitor.visitEquivalence(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class ImplicationContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = PropositionalLogicParser.RULE_implication;
    }

	disjunction = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(DisjunctionContext);
	    } else {
	        return this.getTypedRuleContext(DisjunctionContext,i);
	    }
	};

	IMPLICATION = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(PropositionalLogicParser.IMPLICATION);
	    } else {
	        return this.getToken(PropositionalLogicParser.IMPLICATION, i);
	    }
	};


	accept(visitor) {
	    if ( visitor instanceof PropositionalLogicVisitor ) {
	        return visitor.visitImplication(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class DisjunctionContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = PropositionalLogicParser.RULE_disjunction;
    }

	conjunction = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ConjunctionContext);
	    } else {
	        return this.getTypedRuleContext(ConjunctionContext,i);
	    }
	};

	DISJUNCTION = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(PropositionalLogicParser.DISJUNCTION);
	    } else {
	        return this.getToken(PropositionalLogicParser.DISJUNCTION, i);
	    }
	};


	accept(visitor) {
	    if ( visitor instanceof PropositionalLogicVisitor ) {
	        return visitor.visitDisjunction(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class ConjunctionContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = PropositionalLogicParser.RULE_conjunction;
    }

	negation = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(NegationContext);
	    } else {
	        return this.getTypedRuleContext(NegationContext,i);
	    }
	};

	CONJUNCTION = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(PropositionalLogicParser.CONJUNCTION);
	    } else {
	        return this.getToken(PropositionalLogicParser.CONJUNCTION, i);
	    }
	};


	accept(visitor) {
	    if ( visitor instanceof PropositionalLogicVisitor ) {
	        return visitor.visitConjunction(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class NegationContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = PropositionalLogicParser.RULE_negation;
    }

	NEGATION() {
	    return this.getToken(PropositionalLogicParser.NEGATION, 0);
	};

	parenthesis() {
	    return this.getTypedRuleContext(ParenthesisContext,0);
	};

	accept(visitor) {
	    if ( visitor instanceof PropositionalLogicVisitor ) {
	        return visitor.visitNegation(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class ParenthesisContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = PropositionalLogicParser.RULE_parenthesis;
    }

	LPAR() {
	    return this.getToken(PropositionalLogicParser.LPAR, 0);
	};

	equivalence() {
	    return this.getTypedRuleContext(EquivalenceContext,0);
	};

	RPAR() {
	    return this.getToken(PropositionalLogicParser.RPAR, 0);
	};

	VARIABLE() {
	    return this.getToken(PropositionalLogicParser.VARIABLE, 0);
	};

	CONSTANT() {
	    return this.getToken(PropositionalLogicParser.CONSTANT, 0);
	};

	accept(visitor) {
	    if ( visitor instanceof PropositionalLogicVisitor ) {
	        return visitor.visitParenthesis(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class SequentContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = PropositionalLogicParser.RULE_sequent;
    }

	premiseList() {
	    return this.getTypedRuleContext(PremiseListContext,0);
	};

	SEQUENT() {
	    return this.getToken(PropositionalLogicParser.SEQUENT, 0);
	};

	equivalence() {
	    return this.getTypedRuleContext(EquivalenceContext,0);
	};

	accept(visitor) {
	    if ( visitor instanceof PropositionalLogicVisitor ) {
	        return visitor.visitSequent(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class PremiseListContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = PropositionalLogicParser.RULE_premiseList;
    }

	equivalence = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(EquivalenceContext);
	    } else {
	        return this.getTypedRuleContext(EquivalenceContext,i);
	    }
	};

	accept(visitor) {
	    if ( visitor instanceof PropositionalLogicVisitor ) {
	        return visitor.visitPremiseList(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}




PropositionalLogicParser.LogicContext = LogicContext; 
PropositionalLogicParser.EquivalenceContext = EquivalenceContext; 
PropositionalLogicParser.ImplicationContext = ImplicationContext; 
PropositionalLogicParser.DisjunctionContext = DisjunctionContext; 
PropositionalLogicParser.ConjunctionContext = ConjunctionContext; 
PropositionalLogicParser.NegationContext = NegationContext; 
PropositionalLogicParser.ParenthesisContext = ParenthesisContext; 
PropositionalLogicParser.SequentContext = SequentContext; 
PropositionalLogicParser.PremiseListContext = PremiseListContext; 
