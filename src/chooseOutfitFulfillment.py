import logging
import json
import urllib2
import boto3
import dateutil.parser
import datetime, time
from botocore.vendored import requests

logger = logging.getLogger()
logger.setLevel(logging.INFO)

#WALMART API KEY
WALMART_API = "2aq6k5pteh9qwr5nej682nur"
#DARK SKY API KEY
DARK_API = "4dc2a90af2cb985104b1918d7c81fcae"
#GOOGLE API KEY
GOOGLE_API ="AIzaSyCzojnMKr_DT4tXG3VuDMNo8HeUvYoByuY"

# REFERENCE TABLE
dynamodb = boto3.resource('dynamodb', region_name='us-west-2')
my_table = dynamodb.Table('queries')
user_table = dynamodb.Table('cloud_project_user')


class LexEvent:
    def __init__(self, event):
        self.event = event
        self.slots = event['currentIntent']['slots']
        self.intent = event['currentIntent']['name']
        self.attr = event['sessionAttributes']
        self.src = event['invocationSource']
        self.uid = event["userId"]
        #self.uid = "123456789"
        #print "user id is " + self.uid

        self.city = self.slots["city"]
        self.country = self.slots["country"]
        self.venue = self.slots["venue"]
        self.etype = self.slots["type"]
        self.dt = self.slots["doe"]
        self.color = self.slots["color"]


    def delegate(self):
        return {
            'sessionAttributes': self.attr,
            'dialogAction': {
                'type': 'Delegate',
                'slots': self.slots
            }
        }


    def fulfill(self):

        try:
            avg_t = get_temperature(self.city, self.country, self.dt)
            print "temp is ", avg_t
            
            print "uid is ", self.uid
            usr = user_table.get_item(
                Key={
                    "userid": self.uid
                }
            )
            dob = usr['Item']['dob']
            gender = usr['Item']['gender']
            print "user is ", dob, gender

            age = get_age(dob)
            print "age is ", age

            resp = get_recommendations(avg_t, self.etype, age, gender)
            #print "recommendations are ", resp

            '''
            resp = {"coat": [
                        {"name": "Lavender Essential Peacoat Jacket (Baby Girls & Toddler Girls)",
                        "image": "https://i5.walmartimages.com/asr/c7e62932-4057-4f0b-8fd0-a1d98f318940_1.19622c5bd5084b01ce07ffbe1b3d3ea4.jpeg?odnHeight=450&odnWidth=450&odnBg=FFFFFF",
                        "price": 7.5,
                        "product_url": "http://c.affil.walmart.com/t/api02?l=https%3A%2F%2Fwww.walmart.com%2Fip%2FLavender-Essential-Peacoat-Jacket-Baby-Girls-Toddler-Girls%2F876658200%3Faffp1%3DBeK6fPy5CA8IHHcsWlNfbV2Dwl9KSE4mar4TFMq0IjM%26affilsrc%3Dapi%26veh%3Daff%26wmlspartner%3Dreadonlyapi"
                        }
                    ],
                    "jeans": [
                        {"name": "No Boundaries Juniors' Classic Skinny Jeans",
                        "image": "https://i5.walmartimages.com/asr/ffdc3764-23d0-4b05-913e-d84f5abb510c_1.49ab5dc74e2a7ccf0dc4cc4b5c09e412.jpeg?odnHeight=450&odnWidth=450&odnBg=FFFFFF",
                        "price": 9.78,
                        "product_url": "http://c.affil.walmart.com/t/api02?l=https%3A%2F%2Fwww.walmart.com%2Fip%2FNo-Boundaries-Juniors-Classic-Skinny-Jeans%2F44108242%3Faffp1%3DBeK6fPy5CA8IHHcsWlNfbV2Dwl9KSE4mar4TFMq0IjM%26affilsrc%3Dapi%26veh%3Daff%26wmlspartner%3Dreadonlyapi"
                        }
                    ]
                }
            '''

            return self.close(json.dumps(resp))

        except:
            return self.close("I'm unable to process this request currently. Please try again later.")



    def close(self, message):
        return {
            'sessionAttributes': self.attr,
            'dialogAction': {
                'type': 'Close',
                'fulfillmentState': 'Fulfilled',
                'message': {'contentType': 'PlainText', 'content': message }
            }
        }



    def elicit_slot(self, slot_to_elicit, message):
        return {
            'sessionAttributes': self.attr,
            'dialogAction': {
                'type': 'ElicitSlot',
                'intentName': self.intent,
                'slots': self.slots,
                'slotToElicit': slot_to_elicit,
                'message': {'contentType': 'PlainText', 'content': message }
            }
        }


    def validate_input(self):
        res = {
            'isValid': True,
            'violatedSlot': 'None',
            'message': {'contentType': 'PlainText', 'content': 'Slots Valid'}
        }
        if self.dt is not None:
            if not isvalid_date(self.dt):
                res['isValid'] = False
                res['violatedSlot'] = 'Date'
                res['message'] = 'That is not a valid date. On what date is the event?'
                return res

            fmt_dt = datetime.datetime.strptime(self.dt, '%Y-%m-%d').date()

            if fmt_dt < datetime.date.today():
                #Can't change the past
                res['isValid'] = False
                res['violatedSlot'] = 'Date'
                res['message'] = "It's too late to plan for the past. Please choose a future date for the event."
                return res

        return res



""" --- Helper Functions --- """
def isvalid_date(date):
    try:
        dateutil.parser.parse(date)
        return True
    except ValueError:
        return False


def get_age(date):
    print "getting age"
    dt = datetime.datetime.strptime(date, "%Y-%m-%d")
    print "birthdate is ", dt
    today = datetime.date.today()
    age = today.year - dt.year - ((today.month, today.day) < (dt.month, dt.day))
    return age


## GET TEMPERATURE FOR EVENT DATE IN LOCATION
def get_temperature(city, country, occasion_date):
    """
    RETURNS expected temperature at the indicated event date
    """

    date = occasion_date.split("-")
    event_date_month_int = int(date[1])
    event_date_day_int =  int(date[2])
    event_date_year_int = int(date[0])

    dt = datetime.datetime(event_date_year_int, event_date_month_int, event_date_day_int)
    now = datetime.datetime.now()
    current_year_int = now.year
    current_month_int = now.month
    current_day_int = now.day

    url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + city + "," + country + "&key=" + GOOGLE_API
    r = requests.get(url = url)
    loc_data = r.json()
    #print loc_data

    #acquire Dark Sky Weather Information based on city and country provided by the user
    lat = loc_data["results"][0]['geometry']['location']['lat'] #int
    long = loc_data["results"][0]['geometry']['location']['lng'] #int
    unix_time = int(time.mktime(dt.timetuple()))
    temperature = 0

    #get weather data from the seven day forecast
    url2 = "https://api.darksky.net/forecast/" + DARK_API  + "/" + str(lat) + "," + str(long) + "," + str(unix_time)
    #PARAMS = {"key":DARK_API, "time": unix_time}
    PARAMS = {"exclude": {"currently", "flags"}}
    r2 = requests.get(url2, params = PARAMS)
    #r2 = requests.get(url2)

    weather_data = r2.json()
    #print weather_data["daily"]["data"][0]["temperatureMin"]
    #print weather_data["daily"]["data"][0]["temperatureMax"]
    #temperatureMax

    min_temp = weather_data["daily"]["data"][0]["temperatureMin"]
    max_temp = weather_data["daily"]["data"][0]["temperatureMax"]
    avg_temp = int((max_temp + min_temp)/2.0)

    #print "average temp is", avg_temp
    return avg_temp


'''--- Get recommendations from walmart ---'''
def get_recommendations(temperature,  occasion_type, age, gender):
    if gender == "M":
        categoryId = "5438_133197"
        kids = "boys"
    else:
        categoryId = "5438_133162"
        kids = "girls"
        
    print("temperature ", temperature)    
    temperature = int(temperature)
    print(type(temperature))

    #Create Weather Classification
    if temperature > 75:
        temp_class = "hot"
    elif temperature > 45:
        temp_class = "mild"
    else:
        temp_class = "cold"

    if age > 18:
        age_group = "adult"
    elif age > 13:
        age_group = "teen"
    else:
        age_group = "child"
        categoryId = "5438"

    #DESIGN THE API CALLS
    #categoryId
    #women 5438_133162
    #men 5438_133197

    print("temp_class " + temp_class)
    print("occasion_type "  + occasion_type)
    print("age_group " + age_group)
    print("gender " + gender)

    URL = "http://api.walmartlabs.com/v1/search"
    query_items = produce_query(temp_class, occasion_type, age_group, gender)

    #print("query items " + str(query_items))
    return_suggestions = {}

    print(query_items)

    for query in query_items:
        #query = "winter coat"
        return_suggestions[query] = []

        query1 = query

        if age_group == "child" and query != "scarf":
            query1 = query + " " + kids
            categoryId = "5438_7712430_7809949_3361927"

        if query == "tank top" and gender == "M" and age_group != "child":
            categoryId = "5438_133197_4237948_5178426"
        
        if query == "suit jacket" and gender == "M" and age_group != "child":
            categoryId = "5438_133197_8220242_7377573"

        if query == "button down" and gender == "M" and age_group == "child":
            categoryId = "5438_133197_8220242_7377573"
            
        if query == "dress shirt" and gender == "M":
            categoryId = "5438_133197_6970290"


        PARAMS = {"apiKey": WALMART_API, "query":query1, "sort":"bestseller", "numItems":3, "categoryId": categoryId}

        if gender == "M":
            categoryId = "5438_133197"

        # sending get request and saving the response as response object
        r = requests.get(url = URL, params = PARAMS)

        response = r.json()
        MAX_ITEMS = 3

        i = 0
        for item in response["items"]:
            if i >= MAX_ITEMS:
                break
            item_name = item["name"]
            item_image = item["largeImage"]

            try:
                item_price = item["salePrice"]
            except:
                item_price = 0

            try:
                product_url = item["productUrl"]
            except:
                product_url= "https://www.walmart.com/ip/Apple-iPod-Touch-8GB-32GB-and-64GB-newest-model/15076191?sourceid=api013ad0112f5f3d4dd184d8005be87870e0&affp1=8yqZr6hCEXKleRdPqTTLWaKl_Rtb2hdYgkMBO27pis4&affilsrc=api&veh=aff&wmlspartner=readonlyapi"

            item_object = {
                "name": item_name,
                "image":item_image,
                "price": item_price,
                "product_url":product_url
            }
            return_suggestions[query].append(item_object)
            i += 1

    return return_suggestions




def produce_query(temp_class, occasion_type, age_group, gender):
    response = my_table.scan()
    results =  []
    for item in response["Items"]:
        if temp_class in item["weather"] and occasion_type in item["occasion"] and age_group in item["age"] and gender in item["gender"]:
            results.append(item["item_name"])

    return results






""" --- Functions that control the bot's behavior --- """
def clothing_sugg(lex):

    # Perform basic validation on the supplied input slots.
    # Use the elicitSlot dialog action to re-prompt for the first violation detected.
    res = lex.validate_input()
    if not res['isValid']:
        lex.slots[res['violatedSlot']] = None
        return lex.elicit_slot(res['violatedSlot'], res['message'])

    # If everything's alright, fulfill
    if lex.src == 'DialogCodeHook':
        return lex.delegate()
    else:
        return lex.fulfill()



def unknown_intent(lex):
    return lex.close("I'm unable to process that request. Please ask me for fashion advice.")


""" --- Check Intent and return results --- """
def dispatch(lex):
    if lex.intent == 'ChooseOutfit':
        return clothing_sugg(lex)
    else:
        return unknown_intent(lex)


''' --- Main function --- '''
def lambda_handler(event, context):
    lex = LexEvent(event)
    logger.info(('IN', event))

    try:
        result = dispatch(lex)
        logger.info(('OUT', result))
        return result

    except Exception as e:
        logger.error(e)
        return e
