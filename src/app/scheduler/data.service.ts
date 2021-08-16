import { Injectable } from '@angular/core';
import { DayPilot } from 'daypilot-pro-angular';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import EventData = DayPilot.EventData;

@Injectable()
export class DataService {
	// dataUrl: 'http://localhost:3000';
	constructor(private http: HttpClient) {}

	getEvents(from: DayPilot.Date, to: DayPilot.Date): Observable<EventData[]> {
		return this.http
			.get<any>('http://localhost:3000' + '/events?from=' + from.toString() + '&to=' + to.toString())
			.pipe(map((array) => array.map(this.transformEventJsonToData)));
	}

	getResources(): Observable<any> {
		return this.http.get('http://localhost:3000' + '/resources');
	}

	createEvent(e: EventData): Observable<EventData> {
		var transformed = this.transformEventDataToJson(e);
		return this.http
			.post<EventJson>('http://localhost:3000' + '/events', transformed)
			.pipe(map(this.transformEventJsonToData));
	}

	deleteEvent(id: string): Observable<any> {
		return this.http.delete('http://localhost:3000' + '/events/' + id);
	}

	updateEvent(e: EventData): Observable<any> {
		var transformed = this.transformEventDataToJson(e);
		return this.http.put('http://localhost:3000' + '/events/' + e.id, transformed);
	}

	transformEventJsonToData: ((json: EventJson) => EventData) = (json) => ({
		id: json.id,
		start: json.start,
		end: json.end,
		text: json.text,
		resource: json.resourceId
	});

	transformEventDataToJson: ((data: EventData) => EventJson) = (data) => ({
		id: data.id as number,
		start: data.start instanceof DayPilot.Date ? data.start.toString() : data.start,
		end: data.end instanceof DayPilot.Date ? data.end.toString() : data.end,
		text: data.text,
		resourceId: data.resource as number
	});
}

export class EventJson {
	id?: number;
	start?: string;
	end?: string;
	text?: string;
	resourceId?: number;
}
