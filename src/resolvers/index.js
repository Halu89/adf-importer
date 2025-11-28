import Resolver from "@forge/resolver";

const resolver = new Resolver();

resolver.define("getText", (req) => {
    console.log(req);

    return "Hello, world!";
});

resolver.define("issue-comment-added", (event) => {
        console.log(event);
        return;
    }
)

resolver.define("issue-attachment-added", (event) => {
        console.log(event);
        return;
    }
)

export const handler = resolver.getDefinitions();
