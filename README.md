
# Intro
The StoreX builds to help you store data and connect it both to the UI. or to whatever in a simple, clear, pattern-driven, and modular way.

## The library methodology and principles are:
* Separate the data containers and management from the GUI.
* Separate the logic parts from the GUI.
* Create your store's either as a singleton or create a new instance per component, depends on your needs.
* Control the data binding flow. (No magic data binding).
* Data drive components.
* Modular stores. Write many stores with the least dependency as possible (contain the data in layers).
* Always prepare the data for the GUI.

## The main concepts are
* Dispatcher - dispatch some events / messages. that is the basic class for everything.
* Subscribe - subscribe to the dispatcher/s and do something on change.
# Packages
There are some packages in this repo as the following.

## @storex/core
The core lib contains the components relates to the data binding (Dispatcher and Subscriber).

## @storex/react
The main lib for React that contains components and hooks to subscribe to the dispatcher/s class conveniently.

## @storex/container
The Container lib contains some classes such as Collection, Cache, and Dispatcher, to make data flow more easily and clear.

## @storex/utils
The Utils lib contains some helpers for JSON-schema and async actions.

# Note
This library isn't an observable lib, for that there are better libraries such as Mobx lib. This lib is written to help you manage your data (especially when the data is not preparing to the view) and connect between the data and the GUI. The library performances are very high, and there some optimizations for the dispatch action.
