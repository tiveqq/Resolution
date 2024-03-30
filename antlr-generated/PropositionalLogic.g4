grammar PropositionalLogic;

WS          : [ \t]+ -> skip ;
NEWLINE     : ('\r'? '\n' | '\r') -> skip ;

IMPLICATION : '=>' | '⇒';
EQUIVALENCE : '<=>' | '⇔';
DISJUNCTION : '||' | '∨';
CONJUNCTION : '&&' | '∧';
NEGATION    : '!' | '¬' | '~';
LPAR        : '(';
RPAR        : ')';
VARIABLE    : [a-zA-Z]+ | [α-ω]+;
CONSTANT    : '⊤' | '⊥';
SEQUENT     : '⊢';

logic       : equivalence | sequent ;

equivalence : (implication
                (EQUIVALENCE implication)* NEWLINE?)+ ;

implication : disjunction
                (IMPLICATION disjunction)* ;

disjunction : conjunction
                (DISJUNCTION conjunction)* ;

conjunction : negation
                (CONJUNCTION negation)* ;

negation    : NEGATION
                parenthesis | parenthesis;

parenthesis : LPAR equivalence RPAR | VARIABLE | CONSTANT;

sequent     : premiseList (SEQUENT equivalence) ;

premiseList : equivalence (',' equivalence)* ;

// TODO: parenthesis don't work as needed
// TODO: negation    : NEGATION negation | parenthesis ; (try maybe)