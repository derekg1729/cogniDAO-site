/**
 * @fileoverview Custom ESLint rules for CogniDAO
 */

module.exports = {
  rules: {
    'no-edge-runtime': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Disallow edge runtime declarations',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: 'code',
        schema: [], // no options
      },
      create: function(context) {
        return {
          // Check for export const runtime = "edge" or export const runtime = 'edge'
          ExportNamedDeclaration(node) {
            if (node.declaration && 
                node.declaration.type === 'VariableDeclaration' &&
                node.declaration.declarations.length > 0) {
              const declaration = node.declaration.declarations[0];
              if (declaration.id && 
                  declaration.id.name === 'runtime' && 
                  declaration.init && 
                  (declaration.init.value === 'edge' || declaration.init.value === 'experimental-edge')) {
                context.report({
                  node,
                  message: 'Edge runtime declarations are not allowed. Use Node.js runtime instead.',
                  fix: function(fixer) {
                    return fixer.remove(node);
                  }
                });
              }
            }
          }
        };
      }
    }
  }
}; 