import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { DayPilot, DayPilotSchedulerComponent } from 'daypilot-pro-angular';
import { DataService, EventJson } from './data.service';
import EventData = DayPilot.EventData;
import SchedulerConfig = DayPilot.SchedulerConfig;

@Component({
	selector: 'scheduler-component',
	template: `
    <daypilot-scheduler [config]="config" [events]="events" #scheduler></daypilot-scheduler>`,
	styles: [ `` ]
})
export class SchedulerComponent implements AfterViewInit {
	@ViewChild('scheduler', { static: false })
	scheduler: DayPilotSchedulerComponent;

	events: EventData[] = [];

	config: SchedulerConfig = {
		timeHeaders: [ { groupBy: 'Month' }, { groupBy: 'Day', format: 'd' } ],
		rowHeaderColumns: [ { title: 'Name', display: 'name' }, { title: 'Total' } ],
		scale: 'CellDuration',
		cellDuration: 720,
		days: DayPilot.Date.today().daysInYear(),
		startDate: DayPilot.Date.today().firstDayOfYear(),
		eventHeight: 40,
		headerHeight: 40,
		cellWidth: 20,
		allowEventOverlap: false,
		onBeforeEventRender: (args) => {
			args.data.moveVDisabled = true;
			args.data.html = new DayPilot.Duration(args.data.start, args.data.end).totalDays() + ' absence';
			args.data.backColor = '#FF8C8C';
			args.data.barColor = '#FF0B0B';
			args.data.barBackColor = args.data.barColor;
		},
		onBeforeRowHeaderRender: (args) => {
			let totalDuration = args.row.events.totalDuration();
			if (totalDuration.days() > 0) {
				args.row.columns[1].html = totalDuration.totalDays() + ' days';
			}
		},
		onBeforeCellRender: (args) => {
			let day = args.cell.start.getDayOfWeek();
			if (day === 6 || day === 0) {
				args.cell.disabled = true;
			}
		},
		onTimeRangeSelected: (args) => {
			const form = [
				{ name: 'Start', id: 'start', dateFormat: 'M/d/yyyy hh:mm tt' },
				{ name: 'End', id: 'end', dateFormat: 'M/d/yyyy hh:mm tt' },
				{ name: 'Employee', id: 'resource', options: this.config.resources }
			];
			const data: EventData = {
				id: 0,
				start: args.start,
				end: args.end,
				resource: args.resource,
				text: null
			};
			DayPilot.Modal.form(form, data).then((args) => {
				this.scheduler.control.clearSelection();
				if (args.canceled) {
					return;
				}
				this.ds.createEvent(args.result).subscribe((result) => {
					this.scheduler.control.events.add(result);
				});
			});
		},
		onEventClick: (args) => {
			const form = [
				{ name: 'Start', id: 'start', type: 'date', dateFormat: 'M/d/yyyy h:mm tt' },
				{ name: 'End', id: 'end', type: 'date', dateFormat: 'M/d/yyyy h:mm tt' },
				{ name: 'Employee', id: 'resource', options: this.config.resources }
			];
			const data = args.e.data;
			DayPilot.Modal.form(form, data).then((args) => {
				this.scheduler.control.clearSelection();
				if (args.canceled) {
					return;
				}
				this.ds.updateEvent(args.result).subscribe((result) => {
					this.scheduler.control.events.update(args.result);
					this.scheduler.control.message('Created');
				});
			});
		},
		eventDeleteHandling: 'Update',
		onEventDeleted: (args) => {
			this.ds.deleteEvent(args.e.data.id).subscribe((result) => {
				this.scheduler.control.message('Deleted');
			});
		},
		onEventMoved: (args) => {
			this.ds.updateEvent(args.e.data).subscribe((result) => {
				this.scheduler.control.message('Moved');
			});
		},
		onEventResized: (args) => {
			this.ds.updateEvent(args.e.data).subscribe((result) => {
				this.scheduler.control.message('Resized');
			});
		}
	};

	constructor(private ds: DataService) {}

	ngAfterViewInit(): void {
		this.scheduler.control.scrollTo(DayPilot.Date.today());

		this.ds.getResources().subscribe((result) => {
			this.config.resources = result;
			console.log('here data recource', this.config.resources);
		});

		const from = this.scheduler.control.visibleStart();
		const to = this.scheduler.control.visibleEnd();
		this.ds.getEvents(from, to).subscribe((result) => {
			this.events = result;
			console.log('here events', result);
			// console.log('here DayPilot.date', DayPilot.Date.toString());
		});
	}
}
