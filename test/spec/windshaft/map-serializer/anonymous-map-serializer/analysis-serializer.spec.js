var Backbone = require('backbone');
var AnalysisService = require('../../../../../src/analysis/analysis-service.js');
var CartoDBLayer = require('../../../../../src/geo/map/cartodb-layer');
var VisModel = require('../../../../../src/vis/vis');
var DataviewModel = require('../../../../../src/dataviews/dataview-model-base');
var AnalysisSerializer = require('../../../../../src/windshaft/map-serializer/anonymous-map-serializer/analysis-serializer');

describe('analysis-serializer', function () {
  var visModel;
  var mapModel;
  var layersCollection;
  var dataviewsCollection;
  var analysisCollection;
  var analysisService;
  var analysisDefinition;
  var analysisModel;

  beforeEach(function () {
    mapModel = new Backbone.Model();
    visModel = new Backbone.Model();
    layersCollection = new Backbone.Collection();
    dataviewsCollection = new Backbone.Collection();
    analysisCollection = new Backbone.Collection();
    analysisService = new AnalysisService({
      analysisCollection: analysisCollection,
      camshaftReference: fakeCamshaftReference,
      vis: visModel
    });
    analysisDefinition = {
      id: 'd0',
      type: 'source',
      params: {
        query: 'select * from subway_stops'
      }
    };
    analysisModel = analysisService.analyse(analysisDefinition);
  });

  describe('.serialize', function () {
    describe('layer sources', function () {
      it('should serialize a single analysis', function () {
        var cartoDBLayer = new CartoDBLayer({
          id: 'l1',
          source: analysisModel,
          cartocss: 'cartocssMock',
          cartocss_version: '2.0'
        }, {
          vis: new VisModel()
        });
        layersCollection.reset([ cartoDBLayer ]);

        var actual = AnalysisSerializer.serialize(layersCollection, dataviewsCollection);
        var expected = [ analysisDefinition ];
        expect(actual).toEqual(expected);
      });

      it("should NOT include an analysis if it's part of the analysis of another layer", function () {
        var analysis1 = analysisService.analyse({
          id: 'b1',
          type: 'union',
          params: {
            join_on: 'cartodb_id',
            source: {
              id: 'a2',
              type: 'estimated-population',
              params: {
                columnName: 'estimated_people',
                source: {
                  id: 'a1',
                  type: 'trade-area',
                  params: {
                    kind: 'walk',
                    time: 300,
                    source: {
                      id: 'a0',
                      type: 'source',
                      params: {
                        query: 'select * from subway_stops'
                      }
                    }
                  }
                }
              }
            }
          }
        });
        var analysis2 = analysisService.analyse({
          id: 'a2',
          type: 'estimated-population',
          params: {
            columnName: 'estimated_people',
            source: {
              id: 'a1',
              type: 'trade-area',
              params: {
                kind: 'walk',
                time: 300,
                source: {
                  id: 'a0',
                  type: 'source',
                  params: {
                    query: 'select * from subway_stops'
                  }
                }
              }
            }
          }
        });

        var cartoDBLayer1 = new CartoDBLayer({
          id: 'l1',
          source: analysis1,
          cartocss: 'cartocssMock',
          cartocss_version: '2.0'
        }, {
          vis: new VisModel()
        });

        var cartoDBLayer2 = new CartoDBLayer({
          id: 'l2',
          source: analysis2,
          cartocss: 'cartocssMock',
          cartocss_version: '2.0'
        }, {
          vis: new VisModel()
        });

        layersCollection.reset([
          cartoDBLayer1, cartoDBLayer2
        ]);

        var actual = AnalysisSerializer.serialize(layersCollection, dataviewsCollection);
        var expected = [{
          'id': 'b1',
          'type': 'union',
          'params': {
            'join_on': 'cartodb_id',
            'source': {
              'id': 'a2',
              'type': 'estimated-population',
              'params': {
                'columnName': 'estimated_people',
                'source': {
                  'id': 'a1',
                  'type': 'trade-area',
                  'params': {
                    'kind': 'walk',
                    'time': 300,
                    'source': {
                      'id': 'a0',
                      'type': 'source',
                      'params': {
                        'query': 'select * from subway_stops'
                      }
                    }
                  }
                }
              }
            }
          }
        }];
        expect(actual.length).toEqual(1);
        expect(actual).toEqual(expected);
      });
    });

    describe('dataview sources', function () {
      it('should serialize a single analysis', function () {
        var dataview = new DataviewModel({
          source: analysisModel
        }, {
          map: mapModel,
          vis: visModel,
          analysisCollection: analysisCollection
        });

        dataviewsCollection.reset([ dataview ]);

        var actual = AnalysisSerializer.serialize(layersCollection, dataviewsCollection);
        var expected = [analysisDefinition];
        expect(actual).toEqual(expected);
      });

      it("should NOT include an analysis if it's part of the analysis of another dataview", function () {
        var analysis1 = analysisService.analyse({
          id: 'b1',
          type: 'union',
          params: {
            join_on: 'cartodb_id',
            source: {
              id: 'a2',
              type: 'estimated-population',
              params: {
                columnName: 'estimated_people',
                source: {
                  id: 'a1',
                  type: 'trade-area',
                  params: {
                    kind: 'walk',
                    time: 300,
                    source: {
                      id: 'a0',
                      type: 'source',
                      params: {
                        query: 'select * from subway_stops'
                      }
                    }
                  }
                }
              }
            }
          }
        });
        var analysis2 = analysisService.analyse({
          id: 'a2',
          type: 'estimated-population',
          params: {
            columnName: 'estimated_people',
            source: {
              id: 'a1',
              type: 'trade-area',
              params: {
                kind: 'walk',
                time: 300,
                source: {
                  id: 'a0',
                  type: 'source',
                  params: {
                    query: 'select * from subway_stops'
                  }
                }
              }
            }
          }
        });

        var dataview1 = new DataviewModel({
          source: analysis1
        }, {
          map: mapModel,
          vis: visModel,
          analysisCollection: analysisCollection
        });

        var dataview2 = new DataviewModel({
          source: analysis2
        }, {
          map: mapModel,
          vis: visModel,
          analysisCollection: analysisCollection
        });

        dataviewsCollection.reset([
          dataview1, dataview2
        ]);

        var actual = AnalysisSerializer.serialize(layersCollection, dataviewsCollection);
        var expected = [{
          'id': 'b1',
          'type': 'union',
          'params': {
            'join_on': 'cartodb_id',
            'source': {
              'id': 'a2',
              'type': 'estimated-population',
              'params': {
                'columnName': 'estimated_people',
                'source': {
                  'id': 'a1',
                  'type': 'trade-area',
                  'params': {
                    'kind': 'walk',
                    'time': 300,
                    'source': {
                      'id': 'a0',
                      'type': 'source',
                      'params': {
                        'query': 'select * from subway_stops'
                      }
                    }
                  }
                }
              }
            }
          }
        }];
        expect(actual.length).toEqual(1);
        expect(actual).toEqual(expected);
      });
    });

    it('should only include an analysis once when more than one layer or dataview point to the same analysis', function () {
      var cartoDBLayer1 = new CartoDBLayer({
        id: 'l1',
        source: analysisModel,
        cartocss: 'cartocssMock',
        cartocss_version: '2.0'
      }, {
        vis: new VisModel()
      });

      var cartoDBLayer2 = new CartoDBLayer({
        id: 'l2',
        source: analysisModel,
        cartocss: 'cartocssMock',
        cartocss_version: '2.0'
      }, {
        vis: new VisModel()
      });

      var dataview = new DataviewModel({
        source: analysisModel
      }, {
        map: mapModel,
        vis: visModel,
        analysisCollection: analysisCollection
      });

      layersCollection.reset([
        cartoDBLayer1, cartoDBLayer2
      ]);
      dataviewsCollection.reset([
        dataview
      ]);

      var actual = AnalysisSerializer.serialize(layersCollection, dataviewsCollection);
      var expected = [ analysisDefinition ];
      expect(actual).toEqual(expected);
    });
  });
});

// We use a "fake" reference instead of the one in src/analysis/camshaft-reference
// to ensure that tests won't break if the real thing changes
var fakeCamshaftReference = {
  getSourceNamesForAnalysisType: function (analysisType) {
    var map = {
      'source': [],
      'trade-area': ['source'],
      'estimated-population': ['source'],
      'point-in-polygon': ['points_source', 'polygons_source'],
      'union': ['source']
    };
    if (!map[analysisType]) {
      throw new Error('analysis type ' + analysisType + ' not supported');
    }
    return map[analysisType];
  },

  getParamNamesForAnalysisType: function (analysisType) {
    var map = {
      'source': ['query'],
      'trade-area': ['kind', 'time'],
      'estimated-population': ['columnName'],
      'point-in-polygon': [],
      'union': ['join_on']
    };
    if (!map[analysisType]) {
      throw new Error('analysis type ' + analysisType + ' not supported');
    }
    return map[analysisType];
  }
};