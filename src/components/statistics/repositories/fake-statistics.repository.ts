import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FakeStatisticEntity } from "../schemas/fake-statistics.schema";
import statisticsConstants from "../statistics-constants";

@Injectable()
export class FakeStatisticsRepository {
  constructor(
    @InjectModel(statisticsConstants.models.fakeStatistics)
    private readonly fakeStatisticsModel: Model<FakeStatisticEntity>,
  ) {}

  public setStats(user: any, $set: any) {
    return this.fakeStatisticsModel.findOneAndUpdate({ user }, { $set }, { upsert: true, new: true });
  }

  public getStats(users: any[]) {
    return this.fakeStatisticsModel.find({ user: { $in: users }, enabled: true });
  }
}