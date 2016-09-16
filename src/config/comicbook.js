var comicbook = {
    elements: {
        sceneHeading: {
            strategy: 'regex',
            regex: '(page|PAGE|Page).*(\\([0-9A-Za-z]+ (panels|PANELS)\\))?',
            element: 'h2',
            template: 'Page # (# Panels)',
            force: '!'
        },
        panel: {
            strategy: 'regex',
            regex: '.*?[pP]anel [0-9]+(\\.|:)',
            element: 'strong',
            subElements: {
                action: '.*'
            },
            template: 'Panel #. <action>',
            force: '>'
        },
        character: {
            strategy: 'regex',
            regex: '(([0-9]+ )?.* ?([0-9]+|\\([A-Z]+\\))?:)',
            element: 'td',
            subElements: {
                paren: '( ?\\([A-Z]+\\))?',
                dialogue: '.*'
            },
            template: '# <name>: <dialogue>',
            force: '@'
        },
        dialogue: {
            strategy: 'preceeding',
            preceeding: 'character',
            element: 'p'
        },
        action: {
            strategy: 'preceeding',
            preceeding: 'panel',
            element: 'p'
        }
    },
    defaultElement: 'action'
};

var panelsConfig = {
    comicbook: comicbook
};