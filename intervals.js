//JavaScript interval library, v. 1.0 (with VS IntelliSense comments)
//Copyright (c) 2011 Konrad Kruczynski and Mikael Gielda, http://antmicro.com/

if (!Object.create) { //polyfill taken from MDC
    Object.create = function (o) {
        if (arguments.length > 1) {
            throw new Error('Object.create implementation only accepts the first parameter.');
        }
        function F() {}
        F.prototype = o;
        return new F();
    };
}

var interval = {
    intervals: null,
    initialize: function (intervalArray) {
        ///	<summary>
        ///		1: initialize(intervalArray) - Initializes the (union of) intervals with the specified array of intervals. The form of the array is [{left: <min_val>, to: <max_val>},...]. In-place.
        ///	</summary>
        ///	<param name="intervalArray" type="Array">
        ///		1: intervalArray - the array of intervals to be initailized with.
        ///	</param>
        this.intervals = intervalArray;
        this.normalize();
        return this;
    },
    normalize: function () {
        ///	<summary>
        ///		1: normalize() - Deletes subintervals proper of other intervals comprising this collection, and joins adjacent/overlapping ones so that the resulting interval collection is minimal. In-place.
        ///	</summary> 
        this.intervals.sort(function (a, b) { return a.left - b.left });
        //TODO: more advanced reduce
        for (var i = 0; i < this.intervals.length - 1; i++) {
            if (this.intervals[i].right == this.intervals[i + 1].left) {
                this.intervals[i].right = this.intervals[i + 1].right;
                this.intervals.splice(i + 1, 1);
            }
        }
        return this;
    },
    add : function(interval) {
        /// <summary>
        ///		1: add(interval) - Adds given interval to union of intervals and normalizes it. In-place.
        ///	</summary> 
        this.intervals.push(interval);
        this.normalize();
        return this;
    },
    union: function (addend) {
        ///	<summary>
        ///		1: union(addend) - Joins an interval with this one, returning an union of intervals.
        ///	</summary>
        ///	<param name="addend" type="interval (single)">
        ///		1: addend - the interval to be added to this one.
        ///	</param>
        ///	<returns type="interval" />
        var result = Object.create(interval).initialize([]);
        for (var i in this.intervals) {
            result.intervals.push({ left: this.intervals[i].left, right: this.intervals[i].right });
        }
        for (var i in addend.intervals) {
            result.intervals.push({ left: addend.intervals[i].left, right: addend.intervals[i].right });
        }
        return result.normalize();
    },
    difference: function (subtrahend) {
        ///	<summary>
        ///		1: difference(subtrahend) - Subtracts this a (union of) interval(s) from a this one, returning what is left.
        ///	</summary>
        ///	<param name="subtrahend" type="interval">
        ///		1: subtrahend - the (union of) interval(s) which will be subtracted from this (union of) interval(s).
        ///	</param>
        ///	<returns type="interval" />
        var minuend = Object.create(interval).initialize([]);
        for (var i in this.intervals) {
            minuend.intervals.push({ left: this.intervals[i].left, right: this.intervals[i].right });
        }
        for (var sid in subtrahend.intervals) {
            var mid;
            for (mid = 0; mid < minuend.intervals.length; mid++) {
                if (minuend.intervals[mid].left < subtrahend.intervals[sid].left) {
                    if (minuend.intervals[mid].right > subtrahend.intervals[sid].left) {
                        if (minuend.intervals[mid].right <= subtrahend.intervals[sid].right) {
                            // left side - wanted from won't change
                            minuend.intervals[mid].right = subtrahend.intervals[sid].left;
                        } else {
                            var temp = minuend.intervals.splice(mid, 1)[0];
                            minuend.intervals.push({ left: temp.left, right: subtrahend.intervals[sid].left });
                            minuend.intervals.push({ left: subtrahend.intervals[sid].right, right: temp.right });
                            //mid = -1 // restart, continue will add 1
                        }
                    } else {
                        // unlucky, no common part
                    }
                } else {
                    if (minuend.intervals[mid].left < subtrahend.intervals[sid].right) {
                        if (minuend.intervals[mid].right > subtrahend.intervals[sid].right) {
                            // right side - wanted to won't change
                            minuend.intervals[mid].left = subtrahend.intervals[sid].right;
                        } else {
                            // lucky
                            minuend.intervals.splice(mid, 1);
                            mid--; // = -1; // restart
                        }
                    } else {
                        // unlucky, no common part
                    }
                }

            }
        }
        return minuend.normalize();
    },
    toString: function () {
        ///	<summary>
        ///		1: toString() - Prints the array of intervals in the form <l1,r1> U <l2,r2> U ... U <ln,rn>.
        ///	</summary>
        ///	<returns type="string" />
        var s = new Array();
        for (var i in this.intervals) {
            var curr = this.intervals[i];
            s.push('<' + curr.left + ',' + curr.right + '>');
        }
        return s.join(' U ');
    }
};
