export default interface InterfaceConstructor<T> {
    create(initValues?: {} | null | undefined): T;
}