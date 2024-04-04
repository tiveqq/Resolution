// Generated from PropositionalLogic.g4 by ANTLR 4.13.1
// jshint ignore: start
import antlr4 from 'antlr4';
import Formula from "../src/cnf-converter";


// This class defines a complete generic visitor for a parse tree produced by PropositionalLogicParser.

export default class PropositionalLogicVisitor extends antlr4.tree.ParseTreeVisitor {

	// Visit a parse tree produced by PropositionalLogicParser#logic.
	visitEquivalence(ctx) {
		let left = this.visit(ctx.implication(0));
		for (let i = 1; i < ctx.implication().length; i++) {
			let right = this.visit(ctx.implication(i));
			left = left.equiv(right);
		}
		return left;
	}

	visitImplication(ctx) {
		if (ctx.disjunction().length === 1) {
			return this.visit(ctx.disjunction(0));
		}

		let right = this.visit(ctx.disjunction(ctx.disjunction().length - 1));
		for (let i = ctx.disjunction().length - 2; i >= 0; i--) {
			let left = this.visit(ctx.disjunction(i));
			right = left.implies(right);
		}
		return right;
	}

	visitDisjunction(ctx) {
		let left = this.visit(ctx.conjunction(0));
		for (let i = 1; i < ctx.conjunction().length; i++) {
			let right = this.visit(ctx.conjunction(i));
			left = left.or(right);
		}
		return left;
	}

	visitConjunction(ctx) {
		let left = this.visit(ctx.negation(0));
		for (let i = 1; i < ctx.negation().length; i++) {
			let right = this.visit(ctx.negation(i));
			left = left.and(right);
		}
		return left;
	}

	visitNegation(ctx) {
		if (ctx.NEGATION()) {
			const parenthesisResult = this.visit(ctx.parenthesis());
			if (parenthesisResult !== null) {
				return parenthesisResult.not();
			} else {
				return null;
			}
		} else {
			return this.visit(ctx.parenthesis());
		}
	}

	visitParenthesis(ctx) {
		if (ctx.LPAR()) {
			const result = this.visit(ctx.equivalence());
			return result !== null ? result : null;
		}
		else if (ctx.VARIABLE()) {
			return Formula.getVariable(ctx.VARIABLE().getText());
		}
		else if (ctx.CONSTANT()) {
			if (ctx.CONSTANT().getText() === '⊤') {
				return Formula.trueConstant();
			} else if (ctx.CONSTANT().getText() === '⊥') {
				return Formula.falseConstant();
			}
		}
		else {
			return null;
		}
	}


	visitSequent(ctx) {
		const premises = this.visit(ctx.premiseList());

		const conclusion = this.visit(ctx.equivalence());

		return { premises, conclusion };
	}

	visitPremiseList(ctx) {
		return ctx.equivalence().map(equivalence => this.visit(equivalence));
	}

	visitLogic(ctx) {
		if (ctx.sequent()) {
			return this.visitSequent(ctx.sequent());
		} else if (ctx.equivalence()) {
			return this.visitEquivalence(ctx.equivalence());
		}
	}

}