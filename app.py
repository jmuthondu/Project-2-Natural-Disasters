from flask import Flask, render_template, redirect, request, jsonify
from flask_pymongo import PyMongo
from bson.json_util import dumps
    

#Create an instance for Flask
app = Flask(__name__)

#Use Pymongo to establish Mongo Connection
mongo = PyMongo(app, uri = "mongodb://localhost:27017/weather_data")


#Route to render index.html template using data from Mongo
@app.route("/")
def index():
    
    return render_template("index.html")
    
    

@app.route('/<disaster_type>') 
def natural_disaster(disaster_type):
    if disaster_type == 'floods':
        data = dumps(mongo.db.flood_data.find())
        return  (data)
    
    elif disaster_type == 'earthquakes':
        data = dumps(mongo.db.earthquake_data.find())
        return  (data)
    
    elif disaster_type == "hurricane":
        data = dumps(mongo.db.hurricane_data.find())
        return  (data)
    
    elif disaster_type == 'tornado':
        data = dumps(mongo.db.tornado_data.find())
        return  (data)
    
    else:
        return jsonify({'ok': False, 'message': 'Bad request parameters!'})

@app.route('/<disaster_type>/<myyear>') 
def natural_disaster_years(disaster_type,myyear):
    if disaster_type == 'floods':
        data = dumps(mongo.db.flood_data.find({"year": int(myyear)}))
        return  (data)
    
    elif disaster_type == 'earthquakes':
        data = dumps(mongo.db.earthquake_data.find({"year": int(myyear)}))
        return  (data)
    
    elif disaster_type == "hurricane":
        data = dumps(mongo.db.hurricane_data.find({"year": int(myyear)}))
        return  (data)
    
    elif disaster_type == 'tornado':
        data = dumps(mongo.db.tornado_data.find({"year": int(myyear)}))
        return  (data)
    
    else:
        return jsonify({'ok': False, 'message': 'Bad request parameters!'})
    
    
#@app.route('/q', methods = ['GET'])
#def nd_year():
#    disaster_type = request.args.get('dt')
#    myyear =  request.args.get('yr')
#    print(disaster_type)
#    print(myyear)
#    if disaster_type == 'floods':
#        data = dumps(mongo.db.flood_data.find({ 'year': int(myyear) }))
#        return  (data)
#    
#    elif disaster_type == 'earthquakes':
#        data = dumps(mongo.db.earthquake_data.find({'year': { "$eq": myyear}}))
#        return  (data)
#    
#    elif disaster_type2 == "hurricane":
#        data = dumps(mongo.db.hurricane_data.find({ 'year': myyear }))
#        return  (data)
#    
#    elif disaster_type2 == 'tornado':
#        data = dumps(mongo.db.tornado_data.find({ 'year': myyear }))
#        return  (data)
#    
#    else:
#        return jsonify({'ok': False, 'message': 'Bad request parameters!'})
#

    
if __name__ == "__main__":
    app.run(debug=True)
