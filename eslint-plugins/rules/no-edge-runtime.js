/**
 * No Edge Runtime rule
 */

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow Edge runtime for portability"
    }
  },
  create(context) {
    return {
      Literal(node) {
        if (node.value === 'edge' && 
            context.getSourceCode().getText(node.parent).includes('runtime')) {
          context.report({
            node,
            message: 'Avoid Edge runtime for portability',
          });
        }
      },
      ImportDeclaration(node) {
        if (node.source.value === 'next/server') {
          context.report({
            node,
            message: 'Avoid next/server imports',
          });
        }
      },
    };
  }
}; 