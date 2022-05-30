export default function AllowCustomTag( tag ) {
	return function AllowTag( editor ) {
		editor.model.schema.register( tag, {
			allowWhere: '$block',
			allowContentOf: '$root'
		} );
		editor.model.schema.addAttributeCheck( context => {
			if ( context.endsWith( tag ) ) {
				return true;
			}
		} );

		// The view-to-model converter converting a view <style> with all its attributes to the model.
		editor.conversion.for( 'upcast' ).elementToElement( {
			view: tag,
			model: ( viewElement, { writer: modelWriter } ) => {
				return modelWriter.createElement( tag, viewElement.getAttributes() );
			}
		} );

		// The model-to-view converter for the <style> element (attributes are converted separately).
		editor.conversion.for( 'downcast' ).elementToElement( {
			model: tag,
			view: tag
		} );

		// The model-to-view converter for <style> attributes.
		// Note that a lower-level, event-based API is used here.
		editor.conversion.for( 'downcast' ).add( dispatcher => {
			dispatcher.on( 'attribute', ( evt, data, conversionApi ) => {
				// Convert <style> attributes only.
				if ( data.item.name !== tag ) {
					return;
				}

				const viewWriter = conversionApi.writer;
				const viewStyle = conversionApi.mapper.toViewElement( data.item );
				viewWriter.setAttribute(
					data.attributeKey,
					data.attributeNewValue,
					viewStyle
				);
			} );
		} );
	};
}
