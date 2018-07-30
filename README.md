# Intro
The StoreX builds to help you storing data and connect it to the UI in a simple, clear, pattern driven and modular way

## This library under construction

## Our principles are:
* Seperate the data containers and management from the GUI.
* Seperate the logic parts from the GUI.
* Create your containers as single tone or create a new instance depends on your needs
* Control the data binding flow. (No magic data binding).
* Components (GUI) driven by data.
* Modular containers. write many stores without dependncy (contain the data in layers) as possible.
* Always prepar the data for the GUI.

## The main conspents are
* Dispatcher - dispatch some events / messages. this is the basic class for everythink.
* Subscriper - subscrib to the dispatcher/s and do something on change.
## Modules
there is some module in this lib each of them get responsblty to anther part
### @storex/core
This is the core lib it contain the components reletet to the data binding (Dispatcher and Subscriber)
### @storex/react
This is the main lib for react it contains wrappers for the dispatcher and subscriber, also help you to hold your data as a instace by wrapping the react Contex API
### @storex/container
Contains some known DB patterns Like Collection and View

## Note
This library is not observble lib for that there is Mobx. this lib wrritn to help you to manage your data (espeslly when the data is not prepering to the view) and connect the data to the GUI. the performents are grate, there is optimisstion for the dispatch action 
