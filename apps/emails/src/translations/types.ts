type Messages = typeof import('./en.json');

export type EmailTemplatesI18nMessages = Messages;

export type KeyOf<ObjectType> = ObjectType extends object
	? {
			[Key in keyof ObjectType]: `${Key & string}`;
	  }[keyof ObjectType]
	: never;

export type NestedKeyOf<ObjectType> = ObjectType extends object
	? {
			[Key in keyof ObjectType]:
				| `${Key & string}`
				| `${Key & string}.${NestedKeyOf<ObjectType[Key]>}`;
	  }[keyof ObjectType]
	: never;
