import { nextCsrf } from "next-csrf";

const { csrf, setup } = nextCsrf({
    // eslint-disable-next-line no-undef
    secret: "operating-systems-is-better",

});

export { csrf, setup };