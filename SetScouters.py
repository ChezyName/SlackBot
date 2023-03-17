import json

file = open("scouters.json",'w')

scouters = []

while (True):
    name = input("Type The Scouters Name [FIRST LAST], or Type quit to exit: ")
    if name == 'exit' or name == 'quit':
        #save and quit
        file.write(json.dumps(scouters))
        quit()
    else:
        scouters.append(name)
