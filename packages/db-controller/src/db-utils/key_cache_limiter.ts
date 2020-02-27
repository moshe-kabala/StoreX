import { LinkedListNode, LinkedList } from "./linked_list";
import { Key } from "./types";


export class KeyCacheLimiter {
    __node_map = new Map<Key, LinkedListNode<Key>>();
    __ordered_keys = new LinkedList<Key>();
    __on_remove_func = new Set<(key:Key)=> void>();

    constructor(public limit_count = 10000) {

    }

    private __emit_limited(key: Key) {
        for (const func of Array.from(this.__on_remove_func)) {
            func(key);
        }
    }

    onLimited(func: (key: Key)=> void) {
        if (typeof func == "function") {
            this.__on_remove_func.add(func);
        }
    }

    unlistenOnLimited(func: (key: Key)=> void) {
        this.__on_remove_func.delete(func);
    }

    up(key: Key) {
        const node = this.__node_map.get(key);
        if (node) {
            this.__ordered_keys.remove(node);
            this.__ordered_keys.addToHead(node);
        } else {
            const node = this.__ordered_keys.addValueToHead(key);
            this.__node_map.set(key, node);
        }

        if (this.__node_map.size > this.limit_count) {
           this.limit();
        }
    }

    limit() {
        const node = this.__ordered_keys.removeFromTall();
        this.__node_map.delete(node.value);
        this.__emit_limited(node.value);
    }

    remove(key?:Key) {
        const node = this.__ordered_keys.removeFromTall();
        this.__node_map.delete(node.value);
    }

    clean() {
        this.__node_map = new Map();
        this.__ordered_keys = new LinkedList();
    }
}