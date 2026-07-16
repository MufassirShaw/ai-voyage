type Primitive = string | number | boolean | undefined | null;

/**
 * Path is a type that represents a path to a value in a nested object.
 *
 * @example
 *  ```ts
 *
 *  type ConfigurationType = {
 *    anthropic: {
 *      apiKey: string;
 *      model: string;
 *      maxTokens: number;
 *    };
 *  };
 *
 *  type ConfigPath = Path<ConfigurationType>;
 *
 *  const value: ConfigPath = 'anthropic.apiKey'; // ✅ now type-checked + autocompletion
 *
 *   ```
 *
 */

export type Path<T> = T extends Primitive
  ? never
  : {
      [K in keyof T & (string | number)]: T[K] extends Primitive
        ? `${K}`
        : `${K}` | `${K}.${Path<T[K]>}`;
    }[keyof T & (string | number)];
