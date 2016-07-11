var comicbook = {
    elements: {
        sceneHeading: {
            strategy: 'regex',
            regex: '(page|PAGE).*(\\([0-9A-Za-z]+ (panels|PANELS)\\))?',
            element: 'h2'
        },
        panel: {
            strategy: 'regex',
            regex: '.*?[pP]anel [0-9]+(\\.|:)',
            element: 'strong',
            subElements: {
                action: '.*'
            }
        },
        character: {
            strategy: 'regex',
            regex: '(([0-9]+ )?.* ?([0-9]+|\\([A-Z]+\\))?:)',
            element: 'td',
            subElements: {
                paren: '( ?\\([A-Z]+\\))?',
                dialogue: '.*'
            }
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