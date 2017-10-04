var Backbone = require('backbone');
var TileLayer = require('../../../../../src/geo/map/tile-layer');
var CartoDBLayer = require('../../../../../src/geo/map/cartodb-layer');
var TorqueLayer = require('../../../../../src/geo/map/torque-layer');
var GMapsBaseLayer = require('../../../../../src/geo/map/gmaps-base-layer');
var NamedMapSerializer = require('../../../../../src/windshaft/map-serializer/named-map-serializer/named-map-serializer');

describe('named-map-serializer', function () {
  describe('.serialize', function () {
    beforeEach(function () {
      this.vis = new Backbone.Model();
      this.layersCollection = new Backbone.Collection([]);
      this.analysisCollection = new Backbone.Collection([]);
    });

    it('should include the buffersize', function () {
      var payload = NamedMapSerializer.serialize(this.layersCollection, this.analysisCollection);
      expect(payload.buffersize).toEqual({
        mvt: 0
      });
    });

    it('should send styles of CartoDB and Torque layers using the right indexes', function () {
      this.layersCollection.reset([
        new TileLayer({}, { vis: this.vis }),
        new CartoDBLayer({ cartocss: 'cartoCSS1' }, { vis: this.vis }),
        new TorqueLayer({ cartocss: 'cartoCSS2' }, { vis: this.vis })
      ]);

      var payload = NamedMapSerializer.serialize(this.layersCollection, this.analysisCollection);

      // TileLayer doesn't have cartoCSS but Maps API is aware
      // of them so they're taken into account when calculating
      // indexes for CartoDB and Torque layers
      expect(payload.styles).toEqual({
        1: 'cartoCSS1',
        2: 'cartoCSS2'
      });
    });

    it('should ignore GMapsBase layers when calculating indexes', function () {
      this.layersCollection.reset([
        new GMapsBaseLayer({}, { vis: this.vis }),
        new CartoDBLayer({ cartocss: 'cartoCSS1' }, { vis: this.vis }),
        new TorqueLayer({ cartocss: 'cartoCSS2' }, { vis: this.vis })
      ]);

      var payload = NamedMapSerializer.serialize(this.layersCollection, this.analysisCollection);

      // GMapsBaseLayer doesn't have cartoCSS and Maps API is 
      // NOT aware of them so they're NOT taken into account
      // when calculating indexes for CartoDB and Torque layers
      expect(payload.styles).toEqual({
        0: 'cartoCSS1',
        1: 'cartoCSS2'
      });
    });
  });
});