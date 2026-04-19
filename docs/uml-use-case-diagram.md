# UML Use Case Diagram

~~~mermaid
flowchart LR
  Citizen[Citizen]
  Dispatcher[Dispatcher]
  Admin[Admin]

  UC1([Регистрация])
  UC2([Вход])
  UC3([Подаване на сигнал])
  UC4([Преглед на мои сигнали])
  UC5([AI triage класификация])
  UC6([Dispatcher queue])
  UC7([Назначаване към звено])
  UC8([Промяна на статус])
  UC9([Преглед на аналитика])
  UC10([Управление на feature flags])
  UC11([Управление на config])
  UC12([Преглед на audit activity])

  Citizen --> UC1
  Citizen --> UC2
  Citizen --> UC3
  Citizen --> UC4

  Dispatcher --> UC2
  Dispatcher --> UC6
  Dispatcher --> UC7
  Dispatcher --> UC8
  Dispatcher --> UC9

  Admin --> UC2
  Admin --> UC6
  Admin --> UC7
  Admin --> UC8
  Admin --> UC9
  Admin --> UC10
  Admin --> UC11
  Admin --> UC12

  UC3 -. include .-> UC5
~~~
