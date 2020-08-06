function NameOf<T>(key: keyof T, instance?: T): keyof T {
    return key;
}

export default NameOf;
