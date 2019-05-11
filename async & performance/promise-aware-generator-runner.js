function run(gen) {
	var args = [].slice.call( arguments, 1), it;

	// initialize the generator in the current context
	it = gen.apply( this, args );

	// return a promise for the generator completing
	return Promise.resolve()
		.then( 	function handleNext(value){
			// run to the next yielded value
			var next = it.next( value );

			return (function handleResult(next){
				// generator has completed running?
				if (next.done) {
					return next.value;
				}
				// otherwise keep going
				else {
					return Promise.resolve( next.value )
						.then(
								// resume the async loop on
								// success, sendind the resolved
								// value back into the generator
								handleNext,

								// if `value` is a rejected
								// promise, propogate error back
								// into the generator for its own
								// error handling
								function handleError(err) {
									return Promise.resolve(
										it.throw( err )
									)
									.then( handleResult )
								}
							)
				}
			})(next);
		});
}

function *main() {
	try {
		var text = yield 'main - first yield';
		console.log(text);
	}
	catch (err) {
		console.log(err);
	}
}

debugger;
run( main );
