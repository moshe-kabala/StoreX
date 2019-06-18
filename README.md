# Intro
The StoreX builds to help you store data and connect it both to the UI. or to whatever in a simple, clear, pattern-driven and modular way

## This library is production ready but still under construction

## Our principles are:
* Separate the data containers and management from the GUI.
* Separate the logic parts from the GUI.
* Create your containers as single tone or create a new instance depends on your needs
* Control the data binding flow. (No magic data binding).
* Components (GUI) driven by data.
* Modular containers. write many stores without dependency (contain the data in layers) as possible.
* Always prepare the data for the GUI.

## The main concepts are
* Dispatcher - dispatch some events / messages. this is the basic class for everything.
* Subscribe - subscribe to the dispatcher/s and do something on change.
## Packages
There are some packages in this repo as the following
### @storex/core
This is the core lib it contains the components relates to the data binding (Dispatcher and Subscriber)
### @storex/react
This is the main lib for React it contains components and hooks to subscribe to the dispatcher/s class in a convenient way
### @storex/container
Contains some Classes Like Collection, Cache, and Dispatcher  to make data flow more easy and clear
### @storex/utils
Contains some utils for JSON-schema and async actions

## Note
This library is not observable lib for that there is Mobx. this lib is written to help you to manage your data (especially when the data is not preparing to the view) and connect the data to the GUI. the performance is great, there some optimizations for the dispatch action 
