import "jest";
import {KeyCacheLimiter} from "../../src/cache";


describe("KeyCacheLimiter", ()=> {
    
    test("test up, limit and onLimit event", ()=> {
        const limiter = new KeyCacheLimiter(3);
        let is_on_limited_event_handler_called = false;
        limiter.onLimited((key)=> {
            is_on_limited_event_handler_called = true;
            expect(key).toBe(key1);
        })

        const key1 = "key1";
        const key2 = "key2";
        const key3 = "key3";
        const key4 = "key4";

        limiter.up(key1);
        limiter.up(key2);
        limiter.up(key3);
        limiter.up(key4);

        expect(is_on_limited_event_handler_called).toBeTruthy();
        
        expect(limiter.__node_map.get(key1)).toBeUndefined;
        expect(limiter.__ordered_keys.findByValue(key1)).toBeNull;

        expect(limiter.__node_map.size).toBe(3);
        expect(limiter.__ordered_keys.length).toBe(3);

    })

    test("test remove", ()=> {
        const limiter = new KeyCacheLimiter(3);
        let is_on_limited_event_handler_called = false;
        // expect this function to NOT be called
        limiter.onLimited((_)=> {
            is_on_limited_event_handler_called = true;
        })

        const key1 = "key1";
        const key2 = "key2";
        const key3 = "key3";
        const key4 = "key4";

        limiter.up(key1);
        limiter.up(key2);
        limiter.up(key3);
        limiter.remove(key2);
        limiter.up(key4);

        // make sure the limit event handler not called
        expect(is_on_limited_event_handler_called).toBeFalsy();
        
        expect(limiter.__node_map.get(key2)).toBeUndefined;
        expect(limiter.__ordered_keys.findByValue(key2)).toBeNull;

        expect(limiter.__node_map.size).toBe(3);
        expect(limiter.__ordered_keys.length).toBe(3);
    })

    test("test clean", ()=> {
        const limiter = new KeyCacheLimiter(3);

        const key1 = "key1";
        const key2 = "key2";
        const key3 = "key3";
        const key4 = "key4";

        limiter.up(key1);
        limiter.up(key2);
        limiter.up(key3);
        limiter.up(key4);

        limiter.clean();

        expect(limiter.__node_map.size).toBe(0);
        expect(limiter.__ordered_keys.length).toBe(0);
    })

})