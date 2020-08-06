export interface KeyValue<T = string, U = string> {
    key: T;
    value: U;
}

export interface KeyLabel<T = string, U = string> {
    key: T;
    label: U;
}

export interface IdValue<T = string, U = string> {
    id: T;
    value: U;
}

export interface IdLabel<T = string, U = string> {
    id: T;
    label: U;
}

export interface IdName<T = string, U = string> {
    id: T;
    name: U;
}

export interface Tuple1<T1> {
    item1: T1;
}
export interface Tuple2<T1, T2> {
    item1: T1;
    item2: T2;
}
export interface Tuple3<T1, T2, T3> {
    item1: T1;
    item2: T2;
    item3: T3;
}
export interface Tuple4<T1, T2, T3, T4> {
    item1: T1;
    item2: T2;
    item3: T3;
    item4: T4;
}
export interface Tuple5<T1, T2, T3, T4, T5> {
    item1: T1;
    item2: T2;
    item3: T3;
    item4: T4;
    item5: T5;
}
export interface Tuple6<T1, T2, T3, T4, T5, T6> {
    item1: T1;
    item2: T2;
    item3: T3;
    item4: T4;
    item5: T5;
    item6: T6;
}
export interface Tuple7<T1, T2, T3, T4, T5, T6, T7> {
    item1: T1;
    item2: T2;
    item3: T3;
    item4: T4;
    item5: T5;
    item6: T6;
    item7: T7;
}
export interface Tuple8<T1, T2, T3, T4, T5, T6, T7, T8> {
    item1: T1;
    item2: T2;
    item3: T3;
    item4: T4;
    item5: T5;
    item6: T6;
    item7: T7;
    item8: T8;
}
export interface Tuple9<T1, T2, T3, T4, T5, T6, T7, T8, T9> {
    item1: T1;
    item2: T2;
    item3: T3;
    item4: T4;
    item5: T5;
    item6: T6;
    item7: T7;
    item8: T8;
    item9: T9;
}
