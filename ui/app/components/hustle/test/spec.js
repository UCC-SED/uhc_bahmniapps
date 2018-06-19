describe('Hustle', function() {
	var hustle	=	new Hustle();

	it('has known exported functions', function() {
		var main_exports	=	['open', 'close', 'is_open', 'wipe', 'promisify'];
		var queue_exports	=	['peek', 'put', 'reserve', 'delete', 'release', 'bury', 'kick', 'kick_job', 'count_ready', 'Consumer']; 
		for(var i = 0; i < main_exports.length; i++)
		{
			expect(typeof hustle[main_exports[i]]).toBe('function');
		}
		for(var i = 0; i < queue_exports.length; i++)
		{
			expect(typeof hustle.Queue[queue_exports[i]]).toBe('function');
		}
	});

	it('is awesome', function() {
		expect(true).toBe(true);
	});
});

describe('Hustle queue operations', function() {
	var hustle	=	new Hustle({
		tubes: ['incoming', 'outgoing'],
	});

	// stores some of the ids of our queue items
	var ids	=	{
		first: null,
		priority: null
	};

	it('can clear a database', function(done) {
		var res	=	hustle.wipe();
		expect(res).toBe(true);
		done();
	});

	it('can open a database', function(done) {
		var db	=	null;
		var finished	=	function()
		{
			expect(db instanceof IDBDatabase).toBe(true);
			expect(hustle.is_open()).toBe(true);
			done();
		};
		hustle.open({
			success: function(e) {
				db	=	e.target.result;
				finished();
			},
			error: function(e) {
				console.error('err: ', e);
				finished();
			}
		});
	});

	it('can add queue items', function(done) {
		var num_added	=	0;
		var num_items	=	10;
		var errors		=	[];
		var pri_sum		=	0;
		var next		=	function()
		{
			if(num_added < num_items) return false;
			expect(pri_sum).toBe(((num_items - 1) * 1024) + 1000);
			expect(typeof ids.priority).toBe('number');
			expect(errors.length).toBe(0);
			done();
		}
		var finish_item	=	function(item)
		{
			expect(typeof item.id).toBe('number');
			num_added++;
			pri_sum	+=	item.priority;
			if(item.priority < 1024)
			{
				ids.priority	=	item.id;
			}
			else
			{
				if(!ids.first) ids.first = item.id;
			}
			next();
		};

		var error	=	function(e)
		{
			num_added++;
			console.error('err: ', e);
			errors.push(e);
			next();
		};

		for(var i = 0; i < num_items; i++)
		{
			var data	=	{task: 'say_hello_'+ i};
			hustle.Queue.put(data, {
				tube: 'outgoing',
				// add a higher-priority item
				priority: i == 5 ? 1000 : 1024,
				success: function(item) {
					finish_item(item);
				},
				error: error
			});
		}
	});

	it('should not add duplicate queue items', function(done) {
		var errors			=	[];
		var items			=	[];
		var num_messages	=	3;
		var num_finished	=	0;

		var getUniqueItems = function (items) {
			return items.filter(function (value, index, array) {
				return array.indexOf(value) === index;
			});
		};

		var finish = function()
		{
			num_finished++;
			if(num_finished < num_messages) return;

			var uniqueItems = getUniqueItems(items);
			expect(items.length).toEqual(3);
			expect(uniqueItems.length).toEqual(2);
			expect(uniqueItems).toContain('Job1');
			expect(uniqueItems).toContain('Job2');
			done();
		};

		var addDuplicateItem = function (item) {
			success(item);
			hustle.Queue.put('Job1', {tube: 'outgoing', success: success, comparator:comparator});
		};

		var success	=	function(item)
		{
			items.push(item.data);
			finish();
		};

		var comparator = function (item1, item2) {
			return item1 === item2;
		};

		hustle.Queue.put('Job1', {tube: 'outgoing', success: addDuplicateItem, comparator:comparator});
		hustle.Queue.put('Job2', {tube: 'outgoing', success: success, comparator:comparator});
	});

	it('can reserve an item', function(done) {
		var id		=	null;
		var error	=	false;
		var finish	=	function()
		{
			// should be the lowest priority item
			expect(id).toBe(ids.priority);
			expect(error).toBe(false);
			done();
		};
		hustle.Queue.reserve({
			tube: 'outgoing',
			success: function(item) {
				id	=	item.id;
				finish();
			},
			error: function() {
				error	=	e;
				console.error('err: ', e);
				finish();
			}
		});
	});

	it('can count ready items in a tube', function(done) {
		var count	=	null;
		var error	=	false;
		var finish	=	function()
		{
			expect(error).toBe(false);
			// 10 - 1 reserved item
			expect(count).toBe(11);
			done();
		};
		hustle.Queue.count_ready('outgoing', {
			success: function(num) {
				count	=	num;
				finish();
			},
			error: function(e) {
				error	=	e;
				console.error('err: ', e);
				finish();
			}
		});
	});

	it('gets a null item when none are available', function(done) {
		var item	=	{lol: true};
		var error	=	false;
		var finish	=	function()
		{
			expect(item).toBeNull(null);
			expect(error).toBe(false);
			done();
		};
		hustle.Queue.reserve({
			tube: 'incoming',
			success: function(i) {
				item	=	i;
				finish();
			},
			error: function(e) {
				error	=	e;
				console.error('err: ', e);
				finish();
			}
		});
	});

	it('can bury an item', function(done) {
		var error	=	false;
		var finish	=	function()
		{
			expect(error).toBe(false);
			done();
		};
		hustle.Queue.bury(ids.first, {
			success: function(i) {
				finish();
			},
			error: function(e) {
				error	=	e;
				console.error('err: ', e);
				finish();
			}
		});
	});

	it('can peek queue items', function(done) {
		var num_peeked	=	0;
		var num_items	=	2;
		var errors		=	[];

		var finish		=	function()
		{
			num_peeked++;
			if(num_peeked < num_items) return;
			expect(errors.length).toBe(0);
			done();
		};

		var error	=	function(e)
		{
			errors.push(e);
			console.error('err: ', e);
			finish();
		};

		// first item should be buried
		hustle.Queue.peek(ids.first, {
			success: function(item) {
				expect(item.state).toBe('buried');
				expect(item.buries).toBe(1);
				finish();
			},
			error: error
		});

		// priority item should be reserved
		hustle.Queue.peek(ids.priority, {
			success: function(item) {
				expect(item.state).toBe('reserved');
				expect(item.reserves).toBe(1);
				finish();
			},
			error: error
		});
	});

	it('can kick items', function(done) {
		var errors	=	[];
		var finish	=	function()
		{
			expect(errors.length).toBe(0);
			done();
		};
		hustle.Queue.kick(2, {
			success: function(num) {
				// should return number of jobs kicked
				expect(num).toBe(1);
				finish();
			},
			error: function(e) {
				errors.push(e);
				console.error('err: ', e);
				finish();
			}
		});
	});

	it('can release items', function(done) {
		var errors	=	[];
		var finish	=	function()
		{
			expect(errors.length).toBe(0);
			done();
		};

		hustle.Queue.release(ids.priority, {
			priority: 460,
			success: function() {
				hustle.Queue.peek(ids.priority, {
					success: function(item) {
						expect(item.state).toBe('ready');
						expect(item.tube).toBe('outgoing');
						expect(item.priority).toBe(460);
						finish();
					},
					error: function(e) {
						errors.push(e);
						console.error('err: ', e);
						finish();
					}
				});
			},
			error: function(e) {
				errors.push(e);
				finish();
			}
		});
	});

	it('can delete items', function(done) {
		var errors	=	[];
		var finish	=	function()
		{
			expect(errors.length).toBe(0);
			done();
		};

		hustle.Queue.delete(ids.first, {
			success: function() {
				hustle.Queue.peek(ids.first, {
					success: function(item) {
						expect(item).toBe(null);
						finish();
					},
					error: function(e) {
						errors.push(e);
						console.error('err: ', e);
						finish();
					}
				});
			},
			error: function(e) {
				errors.push(e);
				finish();
			}
		});
	});

	it('gets a null item when deleting items that don\'t exist', function(done) {
		var item	=	{hai: 'lol'};
		var error	=	false;
		var finish	=	function()
		{
			expect(item).toBe(null);
			expect(error).toBe(false);
			done();
		};
		hustle.Queue.delete(6980085, {
			success: function(ditem) {
				item	=	ditem;
				finish();
			},
			error: function(e) {
				error	=	e;
				console.error('err: ', e);
				finish();
			}
		});
	});

	it('can consume a tube', function(done) {
		var num_consumed	=	0;
		var num_items		=	3;
		var errors			=	[];
		var consumer		=	null;
		var ids				=	new Array(num_items);
		var finish	=	function()
		{
			num_consumed++;
			if(num_consumed < num_items) return;
			expect(errors.length).toBe(0);
			expect(consumer.stop()).toBe(true);
			expect(consumer.stop()).toBe(false);	// yes, there should be two
			expect(consumer.stop()).toBe(false);
			done();
		};

		var error	=	function(e)
		{
			errors.push(e);
			console.error('err: ', e);
			finish();
		};

		var dispatch	=	function(item)
		{
			expect(ids.indexOf(item.id) >= 0).toBe(true);
			hustle.Queue.delete(item.id, {
				success: finish,
				error: error
			});
		};
		consumer	=	new hustle.Queue.Consumer(dispatch, {
			tube: 'incoming'
		});

		for(var i = 0; i < num_items; i++)
		{
			var id		=	Math.round(Math.random() * 1000);
			var item	=	{id: id, test: 'YOLOOOO'};
			ids.push(id);
			(function(idx) {
				hustle.Queue.put(item, {
					tube: 'incoming',
					priority: idx,
					success: function(item) {
						ids[idx]	=	item.id;
					},
					error: error
				});
			})(i);
		}
	});

	it('can close a database', function(done) {
		var res	=	hustle.close();
		expect(res).toBe(true);
		expect(hustle.is_open()).toBe(false);
		done();
	});
});

describe('Hustle queue delayed/ttr operations', function() {
	var hustle	=	new Hustle({
		tubes: ['incoming', 'outgoing'],
	});

	it('can clear a database', function(done) {
		var res	=	hustle.wipe();
		expect(res).toBe(true);
		done();
	});

	it('can open a database', function(done) {
		var db	=	null;
		var finished	=	function()
		{
			expect(db instanceof IDBDatabase).toBe(true);
			expect(hustle.is_open()).toBe(true);
			done();
		};
		hustle.open({
			success: function(e) {
				db	=	e.target.result;
				finished();
			},
			error: function(e) {
				console.error('err: ', e);
				finished();
			}
		});
	});

	it('will delay making a queue item ready', function(done) {
		var item1	=	null;
		var item2	=	null;
		var count	=	0;
		var msg		=	'yes, delayed';
		var errors	=	[];
		var finish	=	function()
		{
			count++;
			if(count < 2) return false;

			expect(item1).toBe(null);
			expect(item2 && item2.data).toBe(msg);
			expect(errors.length).toBe(0);
			done();
		};

		var error	=	function(e)
		{
			errors.push(e);
			console.error('err: ', e);
			finish();
		};

		var do_reserve	=	function(is_first)
		{
			hustle.Queue.reserve({
				success: function(item) {
					if(is_first) item1 = item;
					else item2 = item;
					finish();
				},
				error: error
			});
		};

		hustle.Queue.put(msg, {
			delay: 2,
			success: function(item) {
				do_reserve(true);
				setTimeout( function() { do_reserve(false); }, 3000 );
			},
			error: error
		});
	});

	it('will move an expired job back to the ready state', function(done) {
		var errors	=	[];
		var item_id	=	null;
		var state	=	null;
		var finish	=	function()
		{
			expect(errors.length).toBe(0);
			expect(item_id).not.toBe(null);
			expect(state).toBe('ready');
			done();
		};

		var error	=	function(e)
		{
			errors.push(e);
			console.error('err: ', e);
			finish();
		};

		var do_peek	=	function()
		{
			hustle.Queue.peek(item_id, {
				success: function(item) {
					state	=	item.state;
					finish();
					hustle.Queue.delete(item_id);
				},
				error: error
			});
		};

		hustle.Queue.put({test: true}, {
			ttr: 1,
			success: function(item) {
				item_id	=	item.id;
				hustle.Queue.reserve({
					success: function() {
						setTimeout( do_peek, 2000 );
					},
					error: error
				});
			},
			error: error
		});
	});

	it('will reset ttr for touched items', function(done) {
		var errors	=	[];
		var item_id	=	null;
		var state	=	null;
		var finish	=	function()
		{
			expect(errors.length).toBe(0);
			expect(item_id).not.toBe(null);
			expect(state).toBe('reserved');
			done();
		};

		var error	=	function(e)
		{
			errors.push(e);
			console.error('err: ', e);
			finish();
		};

		var do_peek	=	function()
		{
			hustle.Queue.peek(item_id, {
				success: function(item) {
					state	=	item.state;
					finish();
				},
				error: error
			});
		};

		var do_touch	=	function()
		{
			hustle.Queue.touch(item_id, {
				error: error
			});
		};

		hustle.Queue.put({test: true}, {
			ttr: 2,
			success: function(item) {
				item_id	=	item.id;
				hustle.Queue.reserve({
					success: function() {
						setTimeout( do_touch, 1500 );
						setTimeout( do_peek, 3000 );
					},
					error: error
				});
			},
			error: error
		});
	});

	it('can close a database', function(done) {
		var res	=	hustle.close();
		expect(res).toBe(true);
		expect(hustle.is_open()).toBe(false);
		done();
	});
});

describe('Hustle promise API (subset)', function() {
	var hustle	=	new Hustle({
		tubes: ['incoming', 'outgoing'],
	}).promisify();

	it('can clear a database', function(done) {
		var res	=	hustle.wipe();
		expect(res).toBe(true);
		done();
	});

	it('can open a database', function(done) {
		var db	=	null;
		var finished	=	function()
		{
			expect(db instanceof IDBDatabase).toBe(true);
			expect(hustle.is_open()).toBe(true);
			done();
		};
		hustle.open().then(function(e) {
			db	=	e.target.result;
			finished();
		}).catch(function(e) {
			console.error('err: ', e);
			finished();
		});
	});

	it('can add queue items', function(done) {
		var errors			=	[];
		var items			=	[];
		var num_messages	=	2;
		var num_finished	=	0;

		var finish	=	function()
		{
			num_finished++;
			if(num_finished < num_messages) return;
			expect(items[0]).toBe('get this?');
			expect(items[1]).toBe('oh hai.');
			done();
		};

		var success	=	function(item)
		{
			items.push(item.data);
			finish();
		};
		var error	=	function(e)
		{
			errors.push(e);
			console.error('err: ', e);
			finish();
		};
		hustle.Queue.put('get this?', {tube: 'outgoing'}).then(success).catch(error);
		hustle.Queue.put('oh hai.', {tube: 'outgoing'}).then(success).catch(error);
	});

	it('can count ready items in a tube', function(done) {
		var error	=	null;
		var number	=	0;
		var finish	=	function()
		{
			expect(number).toBe(2);
			expect(error).toBe(null);
			done();
		};
		hustle.Queue.count_ready('outgoing').then(function(num) {
			number	=	num;
			finish();
		}).catch(function(e) {
			error	=	e;
			finish();
		})
	});

	it('can reserve (and delete) queue items', function(done) {
		var errors			=	[];
		var items			=	[];
		var num_messages	=	2;
		var num_finished	=	0;

		var finish	=	function()
		{
			num_finished++;
			if(num_finished < num_messages) return;
			expect(items[0]).toBe('get this?');
			expect(items[1]).toBe('oh hai.');
			done();
		};

		var error	=	function(e)
		{
			errors.push(e);
			console.error('err: ', e);
			finish();
		};
		var dsuccess	=	function()
		{
			finish();
		};

		var success	=	function(item)
		{
			items.push(item.data);
			hustle.Queue.delete(item.id).then(dsuccess).catch(error);
		};
		hustle.Queue.reserve({tube: 'outgoing'}).then(success).catch(error);
		hustle.Queue.reserve({tube: 'outgoing'}).then(success).catch(error);
	});

	it('can chain calls', function(done) {
		var error	=	null;
		var send	=	'could i speak to the drug dealer of the house please?';
		var message	=	null;

		var finish	=	function()
		{
			expect(message).toBe(send);
			expect(error).toBe(null);
			done();
		};

		hustle.Queue.put(send, {tube: 'outgoing'}).then(function(item) {
			return hustle.Queue.reserve({tube: 'outgoing'});
		}).then(function(item) {
			message	=	item.data;
			return hustle.Queue.delete(item.id);
		}).then(function() {
			finish();
		}).catch(function(e) {
			error	=	e;
			console.error('err: ', e);
			finish();
		});
	});

	it('can close a database', function(done) {
		var res	=	hustle.close();
		expect(res).toBe(true);
		expect(hustle.is_open()).toBe(false);
		done();
	});
});

describe('Stress tests', function() {
	jasmine.DEFAULT_TIMEOUT_INTERVAL	=	16000;

	var hustle	=	new Hustle({
		tubes: ['jobs'],
	}).promisify();

	it('can clear a database', function(done) {
		var res	=	hustle.wipe();
		expect(res).toBe(true);
		done();
	});

	it('can open a database', function(done) {
		var db	=	null;
		var finished	=	function()
		{
			expect(db instanceof IDBDatabase).toBe(true);
			expect(hustle.is_open()).toBe(true);
			done();
		};
		hustle.open().then(function(e) {
			db	=	e.target.result;
			finished();
		}).catch(function(e) {
			console.error('err: ', e);
			finished();
		});
	});

	it('can withstand a good pounding (queue)', function(done) {
		var con1, con2, con3;
		var errors		=	[];
		var num_items	=	50;
		var got_items	=	0;

		var finish	=	function()
		{
			got_items++;
			if(got_items < num_items) return;

			expect(errors.length).toBe(0);
			con1.stop();
			con2.stop();
			con3.stop();
			done();
		};

		var dispatch	=	function(job)
		{
			finish();
		};

		var errorfn	=	function(e)
		{
			console.error('err: ', e);
			errors.push(e);
			finish();
		};

		con1	=	new hustle.Queue.Consumer(dispatch, {tube: 'jobs', error: errorfn});
		con2	=	new hustle.Queue.Consumer(dispatch, {tube: 'jobs', error: errorfn});
		con3	=	new hustle.Queue.Consumer(dispatch, {tube: 'jobs', error: errorfn});

		var job	=	{type: 'dismantle NSA'};
		for(var i = 0; i < num_items; i++)
		{
			hustle.Queue.put(job, {tube: 'jobs'}).catch(errorfn);
		}
	});

	it('can close a database', function(done) {
		var res	=	hustle.close();
		expect(res).toBe(true);
		expect(hustle.is_open()).toBe(false);
		done();
	});
});

describe('Hustle cleanup abandoned items', function() {
	var hustle = new Hustle({
		tubes: ['jobs']
	});

	beforeEach(function(done) {
		hustle.wipe();
		hustle.open({
			success: done,
			error: done
		});
	});

	afterEach(function() {
		hustle.close();
	});

	it('buries any items in the reserved queue', function(done) {
		var reserved_items = [];
		var number_of_items = 3;

		var fail_spec = function(e) {
			expect(function(){ throw e }).not.toThrow();
			done();
		};

		var add_items_to_queue = function() {
			for(var i = 0; i < number_of_items; i++) {
				hustle.Queue.put('Test Item', {
					success: reserve_item,
					error: fail_spec
				});
			};
		};

		var reserve_item = function() {
			hustle.Queue.reserve({
				success: function(item) {
					reserved_items.push(item);
					call_cleanup_abandoned_items();
				},
				error: fail_spec
			});
		};

		var call_cleanup_abandoned_items = function() {
			if(reserved_items.length == number_of_items) {
				hustle.Queue.cleanup_abandoned_items({
					success: assert_cleanup_was_successful,
					error: fail_spec
				});
			}
		};

		var assert_cleanup_was_successful = function() {
			hustle.Queue.count_reserved({
				success: function(count) {
					expect(count).toBe(0);
					done();
				},
				error: fail_spec
			});
		};

		add_items_to_queue();
	});

	it('still succeeds if there are no abandoned items', function(done) {
		var fail_spec = function(e) {
			expect(function(){ throw e }).not.toThrow();
			done();
		};

		var assert_cleanup_was_successful = function() {
			hustle.Queue.count_reserved({
				success: function(count) {
					expect(count).toBe(0);
					done();
				},
				error: fail_spec
			});
		};

		hustle.Queue.cleanup_abandoned_items({
			success: assert_cleanup_was_successful,
			error: fail_spec
		});
	});
});

describe('Hustle rescue abandoned items', function () {
	var hustle = new Hustle({
		tubes: ['jobs', '_buried']
	});

	var fail_spec = function(e) {
		expect(function(){ throw e }).not.toThrow();
		done();
	};

	beforeEach(function(done) {
		hustle.wipe();
		hustle.open({
			success: done,
			error: done
		});
	});

	afterEach(function() {
		hustle.close();
	});

	it('should put back any item from reserved queue into tube', function (done) {
		var reserved_items = [];
		var number_of_items = 3;

		var add_items_to_queue = function () {
			for(var i = 0; i < number_of_items; i++) {
				hustle.Queue.put('Test Item', {
					tube: 'jobs',
					success: reserve_item,
					error: fail_spec
				});
			}
		};

		var reserve_item = function () {
			hustle.Queue.reserve({
				tube: 'jobs',
				success: function (item) {
					reserved_items.push(item);
					rescue_reserved_items();
				},
				error: fail_spec
			});
		};

		var rescue_reserved_items = function() {
			if(reserved_items.length == number_of_items) {
				hustle.Queue.rescue_reserved_items({
					success: assert_cleanup_was_successful,
					error: fail_spec
				});
			}
		};

		var assert_cleanup_was_successful = function() {
			hustle.Queue.count_reserved({
				success: function(count) {
					expect(count).toBe(0);
				},
				error: fail_spec
			});
			hustle.Queue.count_ready('jobs', {
				success: function (count) {
					expect(count).toBe(number_of_items);
					done();
				},
				error: fail_spec
			});
		};

		add_items_to_queue();
	});

	it('should bury an item if it exceeds max number of abandons', function (done) {
		var reserved_item, number_of_times_moved_to_reserve = 2, count = 0;

		var add_items_to_queue = function () {
			hustle.Queue.put('Test Item', {
				tube: 'jobs',
				success: reserve_item,
				error: fail_spec
			});
		};

		var reserve_item = function () {
			hustle.Queue.reserve({
				tube: 'jobs',
				success: function (item) {
					reserved_item = item;
					rescue_reserved_items();
				},
				error: fail_spec
			});
		};

		var rescue_reserved_items = function () {
			hustle.Queue.rescue_reserved_items({
				success: assert_cleanup_was_successful,
				error: fail_spec,
				maxRescueLimit: 1
			});
		};

		var assert_cleanup_was_successful = function () {
			count++;
			if (number_of_times_moved_to_reserve == count) {
				hustle.Queue.count_ready('jobs', {
					success: function (count) {
						expect(count).toBe(0);
					},
					error: fail_spec
				});
				hustle.Queue.count_ready('_buried', {
					success: function (count) {
						expect(count).toBe(1);
						done();
					},
					error: fail_spec
				});
			} else {
				reserve_item();
			}
		};
		add_items_to_queue()
	});

	it('should not increase the abandon count if it was last rescued with in the rescueTimeLimit', function (done) {
		var reserved_item, number_of_times_moved_to_reserve = 4, count = 0;


		var baseTime = new Date(2014,10,24,9,19,29);
		jasmine.clock().install();
		jasmine.clock().mockDate(baseTime);

		var add_items_to_queue = function () {
			hustle.Queue.put('Test Item', {
				tube: 'jobs',
				success: reserve_item,
				error: fail_spec
			});
		};

		var reserve_item = function () {
			hustle.Queue.reserve({
				tube: 'jobs',
				success: function (item) {
					reserved_item = item;
					rescue_reserved_items();
				},
				error: fail_spec
			});
		};

		var rescue_reserved_items = function () {
			hustle.Queue.rescue_reserved_items({
				success: assert_cleanup_was_successful,
				error: fail_spec,
				maxRescueLimit: 3,
				rescueTimeLimitInSeconds: 2
			});
		};

		var assert_cleanup_was_successful = function () {
			count++;
			if (number_of_times_moved_to_reserve == count) {
				hustle.Queue.peek(reserved_item.id, {
					success: function (item) {
						expect(item.abandon_count).toBe(2);
						done();
					}
				});
			} else {
				jasmine.clock().tick(1000);
				reserve_item();
			}
		};
		add_items_to_queue()
	});

});