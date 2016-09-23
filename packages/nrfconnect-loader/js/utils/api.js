import { Record } from 'immutable';

const ImmutableAppmodule = Record({
    name: null,
    version: null,
    title: null,
    description: null,
    author: null,
    icon: null,
    path: null
});

export function getImmutableAppmodule(appmodule) {
    return new ImmutableAppmodule({
        name: appmodule.name,
        version: appmodule.version,
        title: appmodule.title,
        description: appmodule.description,
        author: appmodule.author,
        icon: appmodule.icon,
        path: appmodule.path
    });
}